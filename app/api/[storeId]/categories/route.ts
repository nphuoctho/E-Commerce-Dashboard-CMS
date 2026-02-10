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

    const { name, billboardId } = await req.json()

    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    if (!billboardId) {
      return new NextResponse('Billboard id URL is required', { status: 400 })
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

    const category = await prismadb.category.create({
      data: {
        name,
        billboardId,
        storeId: storeId,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.log('🚀 ~ [CATEGORIES_POST] ~ error:', error)

    return new NextResponse('Interal Error', { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 })
    }

    const category = await prismadb.category.findMany({
      where: {
        storeId: storeId,
      },
      include: {
        billboard: true,
      },
      take: limit,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.log('🚀 ~ [CATEGORIES_GET] ~ error:', error)

    return new NextResponse('Interal Error', { status: 500 })
  }
}
