import prismadb from '@/lib/prismadb'
import { format } from 'date-fns'
import { FC } from 'react'
import SizeClient from './components/client'
import { SizeColumn } from './components/columns'

interface SizesPageProps {
  params: Promise<{ storeId: string }>
}

const SizesPage: FC<SizesPageProps> = async ({ params }) => {
  const { storeId } = await params

  const sizes = await prismadb.size.findMany({
    where: {
      storeId: storeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const formattedSizes: SizeColumn[] = sizes.map((size) => ({
    id: size.id,
    name: size.name,
    value: size.value,
    createdAt: format(size.createdAt, 'MMMM do, yyyy'),
  }))

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <SizeClient data={formattedSizes} />
      </div>
    </div>
  )
}

export default SizesPage
