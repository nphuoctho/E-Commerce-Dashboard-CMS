import { FileMetadata } from '@/hooks/use-file-upload'
import prismadb from '@/lib/prismadb'
import { FC } from 'react'
import ProductForm from './components/product-form'

interface ProductPageProps {
  params: Promise<{ storeId: string; productId: string }>
}

const ProductPage: FC<ProductPageProps> = async ({ params }) => {
  const { storeId, productId } = await params

  const product = await prismadb.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      images: true,
    },
  })

  const categories = await prismadb.category.findMany({
    where: {
      storeId: storeId,
    },
  })

  const sizes = await prismadb.size.findMany({
    where: {
      storeId: storeId,
    },
  })

  const colors = await prismadb.color.findMany({
    where: {
      storeId: storeId,
    },
  })

  const formattedProduct = product
    ? {
        ...product,
        price: product.price.toString(),
      }
    : null

  const defaultImages: FileMetadata[] =
    formattedProduct?.images.map((img) => {
      return {
        id: img.publicId,
        name: img.name,
        size: img.size,
        type: `image/${img.format}`,
        url: img.url,
      }
    }) ?? []

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <ProductForm
          initialData={formattedProduct}
          defaultImages={defaultImages}
          categories={categories}
          sizes={sizes}
          colors={colors}
        />
      </div>
    </div>
  )
}

export default ProductPage
