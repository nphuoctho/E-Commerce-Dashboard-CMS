import Navbar from '@/components/navbar'
import prismadb from '@/lib/prismadb'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { FC, ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  params: Promise<{ storeId: string }>
}

const DashboardLayout: FC<DashboardLayoutProps> = async ({ children, params }) => {
  const { storeId } = await params
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  })

  if (!store) redirect('/')

  return (
    <>
      <Navbar />
      <div>{children}</div>
    </>
  )
}

export default DashboardLayout
