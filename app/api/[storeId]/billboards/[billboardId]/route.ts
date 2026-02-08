import prismadb from '@/lib/prismadb'
import { deleteMultipleImages, uploadMultipleImages } from '@/services/image-service'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ billboardId: string }> }
) {
  try {
    const { billboardId } = await params

    if (!billboardId) {
      return new NextResponse('Billboard id is required', { status: 400 })
    }

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: billboardId,
      },
      include: {
        image: true,
      },
    })

    return NextResponse.json(billboard)
  } catch (error: unknown) {
    console.log('[BILLBOARD_GET] error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  let uploadedImagePublicId: string | null = null

  try {
    const { userId } = getAuth(req)
    const { storeId, billboardId } = await params

    const { label, image } = await req.json()

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    if (!label) {
      return new NextResponse('Label is required', { status: 400 })
    }

    if (!image) {
      return new NextResponse('Image is required', { status: 400 })
    }

    if (!billboardId) {
      return new NextResponse('Billboard id is required', { status: 400 })
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

    const existingBillboard = await prismadb.billboard.findUnique({
      where: { id: billboardId },
      include: { image: true },
    })

    if (!existingBillboard) {
      return new NextResponse('Billboard not found', { status: 404 })
    }

    // Check if image is new (base64)
    const isNewImage = image.startsWith('data:image/')

    let imageData = existingBillboard.image
      ? {
          url: existingBillboard.image.url,
          publicId: existingBillboard.image.publicId,
          name: existingBillboard.image.name,
          format: existingBillboard.image.format,
          size: existingBillboard.image.size,
        }
      : null

    // Upload new image if changed
    if (isNewImage) {
      const uploadResult = await uploadMultipleImages([image], {
        storeId,
        folder: 'billboards',
      })

      if (!uploadResult.success || !uploadResult.data || uploadResult.data.length === 0) {
        return NextResponse.json(
          { error: 'Image upload failed', details: uploadResult.error },
          { status: 400 }
        )
      }

      uploadedImagePublicId = uploadResult.data[0].publicId

      imageData = {
        url: uploadResult.data[0].url,
        publicId: uploadResult.data[0].publicId,
        name: uploadResult.data[0].fileName || 'untitled',
        format: uploadResult.data[0].format || 'unknown',
        size: uploadResult.data[0].bytes || 0,
      }
    }

    if (!imageData) {
      return new NextResponse('Image data is required', { status: 400 })
    }

    // Update billboard in transaction
    try {
      const billboard = await prismadb.$transaction(async (tx) => {
        return tx.billboard.update({
          where: {
            id: billboardId,
          },
          data: {
            label,
            image: {
              upsert: {
                create: {
                  url: imageData!.url,
                  publicId: imageData!.publicId,
                  name: imageData!.name,
                  format: imageData!.format,
                  size: imageData!.size,
                },
                update: {
                  url: imageData!.url,
                  publicId: imageData!.publicId,
                  name: imageData!.name,
                  format: imageData!.format,
                  size: imageData!.size,
                },
              },
            },
          },
          include: {
            image: true,
          },
        })
      })

      // Delete old image if new one was uploaded
      if (isNewImage && existingBillboard.image?.publicId) {
        await deleteMultipleImages([existingBillboard.image.publicId]).catch((err) =>
          console.error('[BILLBOARD_PATCH] Failed to delete old image:', err)
        )
      }

      return NextResponse.json(billboard)
    } catch (dbError: unknown) {
      console.error('[BILLBOARD_PATCH] Database error:', dbError)

      if (uploadedImagePublicId) {
        await deleteMultipleImages([uploadedImagePublicId]).catch((err) =>
          console.error('[BILLBOARD_PATCH] Failed to cleanup new image:', err)
        )
      }

      return new NextResponse('Failed to update billboard', { status: 500 })
    }
  } catch (error: unknown) {
    console.log('[BILLBOARD_PATCH] error:', error)

    if (uploadedImagePublicId) {
      await deleteMultipleImages([uploadedImagePublicId]).catch((cleanupError) =>
        console.error('[BILLBOARD_PATCH] Cleanup failed:', cleanupError)
      )
    }

    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { userId } = getAuth(req)
    const { storeId, billboardId } = await params

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    if (!billboardId) {
      return new NextResponse('Billboard id is required', { status: 400 })
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

    const billboard = await prismadb.billboard.findUnique({
      where: { id: billboardId },
      include: { image: true },
    })

    if (!billboard) {
      return new NextResponse('Billboard not found', { status: 404 })
    }

    await prismadb.billboard.delete({
      where: {
        id: billboardId,
      },
    })

    if (billboard.image?.publicId) {
      await deleteMultipleImages([billboard.image.publicId]).catch((err) =>
        console.error('[BILLBOARD_DELETE] Failed to delete image from Cloudinary:', err)
      )
    }

    return NextResponse.json(billboard)
  } catch (error: unknown) {
    console.log('[BILLBOARD_DELETE] error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
