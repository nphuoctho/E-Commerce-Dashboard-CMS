import prismadb from '@/lib/prismadb'
import { FC } from 'react'

interface DashboardPageProps {
  params: Promise<{ storeId: string }>
}

const DashboardPage: FC<DashboardPageProps> = async ({ params }) => {
  const { storeId } = await params

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
    },
  })

  return <div>Active Store: {store?.name}</div>
}

export default DashboardPage
