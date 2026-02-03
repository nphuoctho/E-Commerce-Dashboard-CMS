import prismadb from '@/lib/prismadb'
import { FC } from 'react'
import ProductForm from './components/product-form'

interface ProductPageProps {
  params: Promise<{ productId: string }>
}

const ProductPage: FC<ProductPageProps> = async ({ params }) => {
  const { productId } = await params

  const product = await prismadb.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      images: true,
    },
  })

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <ProductForm initialData={product} />
      </div>
    </div>
  )
}

export default ProductPage
