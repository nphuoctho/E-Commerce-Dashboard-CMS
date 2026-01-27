import prismadb from '@/lib/prismadb'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { name } = await req.json()

    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log('🚀 ~ [STORES_POST] ~ error:', error)

    return new NextResponse('Interal Error', { status: 500 })
  }
}
