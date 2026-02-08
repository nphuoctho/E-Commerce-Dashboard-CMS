import prismadb from '@/lib/prismadb'
import { format } from 'date-fns'
import { FC } from 'react'
import ColorClient from './components/client'
import { ColorColumn } from './components/columns'

interface ColorsPageProps {
  params: Promise<{ storeId: string }>
}

const ColorsPage: FC<ColorsPageProps> = async ({ params }) => {
  const { storeId } = await params

  const colors = await prismadb.color.findMany({
    where: {
      storeId: storeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const formattedColors: ColorColumn[] = colors.map((color) => ({
    id: color.id,
    name: color.name,
    value: color.value,
    createdAt: format(color.createdAt, 'MMMM do, yyyy'),
  }))

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <ColorClient data={formattedColors} />
      </div>
    </div>
  )
}

export default ColorsPage
