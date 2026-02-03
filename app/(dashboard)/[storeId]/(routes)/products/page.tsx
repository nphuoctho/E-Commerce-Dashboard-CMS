import prismadb from '@/lib/prismadb'
import { formatter } from '@/lib/utils'
import { format } from 'date-fns'
import { FC } from 'react'
import ProductClient from './components/client'
import { ProductColumn } from './components/columns'

interface ProductsPageProps {
  params: Promise<{ storeId: string }>
}

const ProductsPage: FC<ProductsPageProps> = async ({ params }) => {
  const { storeId } = await params

  const products = await prismadb.product.findMany({
    where: {
      storeId: storeId,
    },
    include: {
      category: true,
      size: true,
      color: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const formattedProducts: ProductColumn[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: formatter.format(product.price.toNumber()),
    category: product.category?.name,
    size: product.size?.name,
    color: product.color?.name,
    isFeatured: product.isFeatured,
    isArchived: product.isArchived,
    createdAt: format(product.createdAt, 'MMMM do, yyyy'),
  }))

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <ProductClient data={formattedProducts} />
      </div>
    </div>
  )
}

export default ProductsPage
