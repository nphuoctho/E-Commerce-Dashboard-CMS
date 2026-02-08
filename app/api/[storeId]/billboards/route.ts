import prismadb from '@/lib/prismadb'
import { deleteMultipleImages, uploadMultipleImages } from '@/services/image-service'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  let uploadedImagePublicId: string | null = null

  try {
    const { userId } = getAuth(req)
    const { storeId } = await params

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    const { label, image } = await req.json()

    if (!label) {
      return new NextResponse('Label is required', { status: 400 })
    }

    if (!image) {
      return new NextResponse('Image is required', { status: 400 })
    }

    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadMultipleImages([image], {
      storeId,
      folder: 'billboards',
    })

    if (!uploadResult.success || !uploadResult.data || uploadResult.data.length === 0) {
      console.error('[BILLBOARD_POST] Image upload failed:', uploadResult.error)
      return NextResponse.json(
        { error: 'Image upload failed', details: uploadResult.error },
        { status: 400 }
      )
    }

    uploadedImagePublicId = uploadResult.data[0].publicId

    const imageData = {
      url: uploadResult.data[0].url,
      publicId: uploadResult.data[0].publicId,
      name: uploadResult.data[0].fileName || 'untitled',
      format: uploadResult.data[0].format || 'unknown',
      size: uploadResult.data[0].bytes || 0,
    }

    // Create billboard with image in transaction
    try {
      const billboard = await prismadb.$transaction(async (tx) => {
        const newImage = await tx.image.create({
          data: {
            url: imageData.url,
            publicId: imageData.publicId,
            name: imageData.name,
            format: imageData.format,
            size: imageData.size,
          },
        })

        const newBillboard = await tx.billboard.create({
          data: {
            label,
            storeId,
            imageId: newImage.id,
          },
        })

        const completeBillboard = await tx.billboard.findUnique({
          where: { id: newBillboard.id },
          include: { image: true },
        })

        if (!completeBillboard) {
          throw new Error('Failed to fetch created billboard')
        }

        return completeBillboard
      })

      return NextResponse.json(billboard, { status: 201 })
    } catch (dbError: unknown) {
      console.error('[BILLBOARD_POST] Database transaction failed:', dbError)

      if (uploadedImagePublicId) {
        await deleteMultipleImages([uploadedImagePublicId]).catch((cleanupError) =>
          console.error('[BILLBOARD_POST] Failed to cleanup image:', cleanupError)
        )
      }

      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error'
      return NextResponse.json(
        { error: 'Failed to create billboard', details: errorMessage },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    console.log('[BILLBOARD_POST] Unexpected error:', error)

    if (uploadedImagePublicId) {
      await deleteMultipleImages([uploadedImagePublicId]).catch((cleanupError) =>
        console.error('[BILLBOARD_POST] Cleanup failed:', cleanupError)
      )
    }

    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params

    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 })
    }

    const billboards = await prismadb.billboard.findMany({
      where: {
        storeId: storeId,
      },
      include: {
        image: true,
      },
    })

    return NextResponse.json(billboards)
  } catch (error) {
    console.log('[BILLBOARDS_GET] error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
