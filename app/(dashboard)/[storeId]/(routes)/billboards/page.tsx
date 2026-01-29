import prismadb from '@/lib/prismadb'
import { FC } from 'react'
import BillboardClient from './components/client'

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

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient data={billboards} />
      </div>
    </div>
  )
}

export default BillboardsPage
