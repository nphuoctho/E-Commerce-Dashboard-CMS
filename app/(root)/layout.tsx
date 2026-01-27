import prismadb from '@/lib/prismadb'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { FC, ReactNode } from 'react'

interface SetupLayoutProps {
  children: ReactNode
}

const SetupLayout: FC<SetupLayoutProps> = async ({ children }) => {
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  const store = await prismadb.store.findFirst({
    where: {
      userId,
    },
  })

  if (store) redirect(`/${store.id}`)

  return <div>{children}</div>
}

export default SetupLayout
