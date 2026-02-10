import { ProductFormValues } from '@/app/(dashboard)/[storeId]/(routes)/products/[productId]/components/product-form'
import { Product } from '@/lib/generated/prisma/client'
import prismadb from '@/lib/prismadb'
import { deleteMultipleImages, uploadMultipleImages } from '@/services/image-service'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// Validation helper
function validateProductData(data: ProductFormValues) {
  const errors: string[] = []

  if (!data.name) errors.push('Name is required')
  if (!data.images || !data.images.length) errors.push('At least one image is required')
  if (!data.price) errors.push('Price is required')
  if (!data.categoryId) errors.push('Category ID is required')
  if (!data.sizeId) errors.push('Size ID is required')
  if (!data.colorId) errors.push('Color ID is required')

  return errors
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  let uploadedImagePublicIds: string[] = []

  try {
    const { userId } = getAuth(req)
    const { storeId } = await params

    // Authentication check
    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    if (!storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }

    // Parse request body
    const body = await req.json()
    const { name, price, categoryId, sizeId, colorId, images, isFeatured, isArchived } = body

    // Validate input
    const validationErrors = validateProductData(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // Verify store ownership
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse('Unauthorized: Store not found or access denied', { status: 403 })
    }

    // Verify related entities exist
    const [categoryExists, sizeExists, colorExists] = await Promise.all([
      prismadb.category.findFirst({ where: { id: categoryId, storeId } }),
      prismadb.size.findFirst({ where: { id: sizeId, storeId } }),
      prismadb.color.findFirst({ where: { id: colorId, storeId } }),
    ])

    if (!categoryExists) {
      return new NextResponse('Category not found', { status: 404 })
    }
    if (!sizeExists) {
      return new NextResponse('Size not found', { status: 404 })
    }
    if (!colorExists) {
      return new NextResponse('Color not found', { status: 404 })
    }

    // Upload images to Cloudinary
    const uploadResult = await uploadMultipleImages(images, {
      storeId,
      folder: 'products',
    })

    if (!uploadResult.success || !uploadResult.data) {
      console.error('[PRODUCT_CREATE] Image upload failed:', uploadResult.error)
      return NextResponse.json(
        { error: 'Image upload failed', details: uploadResult.error },
        { status: 400 }
      )
    }

    // Track uploaded images for cleanup if needed
    uploadedImagePublicIds = uploadResult.data.map((img) => img.publicId)

    const imageData = uploadResult.data.map((img) => ({
      url: img.url,
      publicId: img.publicId,
      name: img.fileName || 'untitled',
      format: img.format || 'unknown',
      size: img.bytes || 0,
    }))

    // Create product with images in transaction
    let product: Product

    try {
      product = await prismadb.$transaction(async (tx) => {
        // Create product
        const newProduct = await tx.product.create({
          data: {
            name,
            price,
            categoryId,
            sizeId,
            colorId,
            isFeatured: isFeatured ?? false,
            isArchived: isArchived ?? false,
            storeId,
          },
        })

        // Create images
        await tx.image.createMany({
          data: imageData.map((img) => ({
            productId: newProduct.id,
            url: img.url,
            publicId: img.publicId,
            name: img.name,
            format: img.format,
            size: img.size,
          })),
        })

        // Fetch complete product with relations
        const completeProduct = await tx.product.findUnique({
          where: { id: newProduct.id },
          include: {
            images: true,
            category: true,
            size: true,
            color: true,
          },
        })

        if (!completeProduct) {
          throw new Error('Failed to fetch created product')
        }

        return completeProduct
      })

      return NextResponse.json(product, { status: 201 })
    } catch (dbError: unknown) {
      console.error('[PRODUCT_CREATE] Database transaction failed:', dbError)

      // Delete uploaded images from Cloudinary
      if (uploadedImagePublicIds.length > 0) {
        console.log('[PRODUCT_CREATE] Rolling back: Deleting uploaded images...')

        const deleteResult = await deleteMultipleImages(uploadedImagePublicIds)

        if (!deleteResult.success) {
          console.error(
            '[PRODUCT_CREATE] Failed to cleanup images:',
            deleteResult.error,
            'Public IDs:',
            uploadedImagePublicIds
          )
          // Log để manual cleanup sau
        } else {
          console.log('[PRODUCT_CREATE] Successfully cleaned up uploaded images')
        }
      }

      // Return appropriate error
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error'

      return NextResponse.json(
        {
          error: 'Failed to create product',
          details: errorMessage,
          code: 'DATABASE_ERROR',
        },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    console.error('[PRODUCT_CREATE] Unexpected error:', error)

    // Cleanup uploaded images nếu có
    if (uploadedImagePublicIds.length > 0) {
      console.log('[PRODUCT_CREATE] Cleaning up images after unexpected error...')

      await deleteMultipleImages(uploadedImagePublicIds).catch((cleanupError) =>
        console.error('[PRODUCT_CREATE] Cleanup failed:', cleanupError)
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params
    const { searchParams } = new URL(req.url)

    if (!storeId) {
      return new NextResponse('Store ID is required', { status: 400 })
    }

    // Parse and validate query parameters (with limit, no offset)
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 50)
    const categoryId = searchParams.get('categoryId')
    const sizeId = searchParams.get('sizeId')
    const colorId = searchParams.get('colorId')
    const isFeaturedParam = searchParams.get('isFeatured')
    const isArchivedParam = searchParams.get('isArchived')
    const searchQuery = searchParams.get('search')?.trim()

    const store = await prismadb.store.findFirst({
      where: { id: storeId },
    })

    if (!store) {
      return new NextResponse('Store not found or access denied', { status: 403 })
    }

    // Build dynamic where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { storeId }

    if (categoryId) where.categoryId = categoryId
    if (sizeId) where.sizeId = sizeId
    if (colorId) where.colorId = colorId
    if (isFeaturedParam !== null) where.isFeatured = isFeaturedParam === 'true'
    if (isArchivedParam !== null) where.isArchived = isArchivedParam === 'true'

    // Add search functionality
    if (searchQuery) {
      where.name = {
        contains: searchQuery,
        mode: 'insensitive',
      }
    }

    // Fetch products matching filters with limit
    const products = await prismadb.product.findMany({
      where,
      include: {
        images: true,
        category: true,
        size: true,
        color: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return NextResponse.json({
      products,
    })
  } catch (error: unknown) {
    console.error('[PRODUCTS_GET] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: 'Failed to fetch products', details: errorMessage },
      { status: 500 }
    )
  }
}
