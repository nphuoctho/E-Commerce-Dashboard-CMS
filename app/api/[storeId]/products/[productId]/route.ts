import prismadb from '@/lib/prismadb'
import { deleteMultipleImages, uploadMultipleImages } from '@/services/image-service'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params

    if (!productId) {
      return new NextResponse('Product id is required', { status: 400 })
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        images: true,
        category: true,
        size: true,
        color: true,
      },
    })

    return NextResponse.json(product)
  } catch (error: unknown) {
    console.log('🚀 ~ [CATEGORY_GET] ~ error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { userId } = getAuth(req)
    const { storeId, productId } = await params

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    const { name, price, categoryId, sizeId, colorId, images, isFeatured, isArchived } =
      await req.json()

    // Validation
    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    if (!images || !images.length) {
      return new NextResponse('Images are required', { status: 400 })
    }

    if (!price) {
      return new NextResponse('Price is required', { status: 400 })
    }

    if (!categoryId) {
      return new NextResponse('Category ID is required', { status: 400 })
    }

    if (!sizeId) {
      return new NextResponse('Size ID is required', { status: 400 })
    }

    if (!colorId) {
      return new NextResponse('Color ID is required', { status: 400 })
    }

    if (!productId) {
      return new NextResponse('Product id is required', { status: 400 })
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

    const existingProduct = await prismadb.product.findUnique({
      where: { id: productId },
      include: { images: true },
    })

    if (!existingProduct) {
      return new NextResponse('Product not found', { status: 404 })
    }

    const incomingImages = images as string[]
    const newBase64Images = incomingImages.filter((img: string) => img.startsWith('data:image/'))
    const existingImageUrls = incomingImages.filter(
      (img: string) => img.startsWith('http://') || img.startsWith('https://')
    )

    const validExistingUrls = existingImageUrls.filter((url) =>
      existingProduct.images.some((img) => img.url === url)
    )

    const uploadedImages: Array<{
      url: string
      publicId: string
      name: string
      format: string
      size: number
    }> = []

    if (newBase64Images.length > 0) {
      const uploadResult = await uploadMultipleImages(newBase64Images, {
        storeId,
      })

      if (!uploadResult.success || !uploadResult.data) {
        return new NextResponse(uploadResult.error || 'Failed to upload images', { status: 400 })
      }

      uploadedImages.push(
        ...uploadResult.data.map((img) => ({
          url: img.url,
          publicId: img.publicId,
          name: img.fileName,
          format: img.format,
          size: img.bytes,
        }))
      )
    }

    const allImages = [
      ...validExistingUrls.map((url: string) => {
        const existing = existingProduct.images.find((img) => img.url === url)
        return {
          url,
          publicId: existing?.publicId || '',
          name: existing?.name || '',
          format: existing?.format || '',
          size: existing?.size || 0,
        }
      }),
      ...uploadedImages,
    ]

    try {
      const product = await prismadb.$transaction(async (tx) => {
        return tx.product.update({
          where: {
            id: productId,
          },
          data: {
            name,
            price,
            categoryId,
            sizeId,
            colorId,
            isFeatured,
            isArchived,
            images: {
              deleteMany: {},
              createMany: {
                data: allImages.map((img) => ({
                  url: img.url,
                  publicId: img.publicId,
                  name: img.name,
                  format: img.format,
                  size: img.size || 0,
                })),
              },
            },
          },
          include: {
            images: true,
            category: true,
            size: true,
            color: true,
          },
        })
      })

      const imagesToDelete = existingProduct.images
        .filter((img) => !validExistingUrls.includes(img.url))
        .map((img) => img.publicId)
        .filter((id): id is string => id !== null)

      if (imagesToDelete.length > 0) {
        await deleteMultipleImages(imagesToDelete).catch((err) =>
          console.error('Failed to delete old images:', err)
        )
      }

      return NextResponse.json(product)
    } catch (dbError: unknown) {
      console.error('🚀 ~ [PRODUCT_PATCH] Database error:', dbError)

      if (uploadedImages.length > 0) {
        const newImageUrls = uploadedImages.map((img) => img.url)
        await deleteMultipleImages(newImageUrls).catch((err) =>
          console.error('Failed to cleanup new images:', err)
        )
      }

      return new NextResponse('Failed to update product', { status: 500 })
    }
  } catch (error: unknown) {
    console.log('🚀 ~ [PRODUCT_PATCH] ~ error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { userId } = getAuth(req)
    const { storeId, productId } = await params

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    if (!productId) {
      return new NextResponse('Category id is required', { status: 400 })
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

    const product = await prismadb.product.findUnique({
      where: { id: productId },
      include: { images: true },
    })

    if (!product) {
      return new NextResponse('Product not found', { status: 404 })
    }

    await prismadb.product.delete({
      where: {
        id: productId,
      },
    })

    const imageUrls = product.images.map((img) => img.url)
    if (imageUrls.length > 0) {
      await deleteMultipleImages(imageUrls).catch((err) =>
        console.error('Failed to delete images from Cloudinary:', err)
      )
    }

    return NextResponse.json(product)
  } catch (error: unknown) {
    console.log('🚀 ~ [CATEGORY_DELETE] ~ error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
