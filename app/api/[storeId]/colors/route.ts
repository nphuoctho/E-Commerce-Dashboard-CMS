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

    const { name, value } = await req.json()

    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    if (!value) {
      return new NextResponse('Value URL is required', { status: 400 })
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

    const color = await prismadb.color.create({
      data: {
        name,
        value,
        storeId: storeId,
      },
    })

    return NextResponse.json(color)
  } catch (error) {
    console.log('🚀 ~ [COLORS_POST] ~ error:', error)

    return new NextResponse('Interal Error', { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params
    const { searchParams } = new URL(req.url)

    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 50)
    const categoryId = searchParams.get('categoryId')

    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 })
    }

    const color = await prismadb.color.findMany({
      where: {
        storeId: storeId,
        ...(categoryId && {
          products: {
            some: {
              categoryId,
            },
          },
        }),
      },
      take: limit,
    })

    return NextResponse.json(color)
  } catch (error) {
    console.log('🚀 ~ [COLORS_GET] ~ error:', error)

    return new NextResponse('Interal Error', { status: 500 })
  }
}
