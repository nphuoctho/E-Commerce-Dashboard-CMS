import prismadb from '@/lib/prismadb'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { userId } = getAuth(req)
    const { storeId } = await params

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    const { label, imageUrl } = await req.json()

    if (!label) {
      return new NextResponse('Label is required', { status: 400 })
    }

    if (!imageUrl) {
      return new NextResponse('Image URL is required', { status: 400 })
    }

    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageUrl,
        storeId: storeId,
      },
    })

    return NextResponse.json(billboard)
  } catch (error) {
    console.log('🚀 ~ [BILLBOARDS_POST] ~ error:', error)

    return new NextResponse('Interal Error', { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params

    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 })
    }

    const billboard = await prismadb.billboard.findMany({
      where: {
        storeId: storeId,
      },
    })

    return NextResponse.json(billboard)
  } catch (error) {
    console.log('🚀 ~ [BILLBOARDS_POST] ~ error:', error)

    return new NextResponse('Interal Error', { status: 500 })
  }
}
