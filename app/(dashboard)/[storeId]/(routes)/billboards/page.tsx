import prismadb from '@/lib/prismadb'
import { format } from 'date-fns'
import { FC } from 'react'
import BillboardClient from './components/client'
import { BillboardColumn } from './components/columns'

interface BillboardsPageProps {
  params: Promise<{ storeId: string }>
}

const BillboardsPage: FC<BillboardsPageProps> = async ({ params }) => {
  const { storeId } = await params

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: storeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const formattedBillboards: BillboardColumn[] = billboards.map((billboard) => ({
    id: billboard.id,
    label: billboard.label,
    createdAt: format(billboard.createdAt, 'MMMM do, yyyy'),
  }))

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <BillboardClient data={formattedBillboards} />
      </div>
    </div>
  )
}

export default BillboardsPage
