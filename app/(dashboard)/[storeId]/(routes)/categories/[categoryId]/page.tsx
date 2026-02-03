import prismadb from '@/lib/prismadb'
import { FC } from 'react'
import CategoryForm from './components/category-form'

interface CategoryPageProps {
  params: Promise<{ storeId: string; categoryId: string }>
}

const CategoryPage: FC<CategoryPageProps> = async ({ params }) => {
  const { storeId, categoryId } = await params

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: storeId,
    },
  })

  const category = await prismadb.category.findUnique({
    where: {
      id: categoryId,
    },
  })

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <CategoryForm billboards={billboards} initialData={category} />
      </div>
    </div>
  )
}

export default CategoryPage
