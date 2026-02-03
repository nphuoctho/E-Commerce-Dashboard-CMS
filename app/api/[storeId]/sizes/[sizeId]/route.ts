import prismadb from '@/lib/prismadb'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ sizeId: string }> }) {
  try {
    const { sizeId } = await params

    if (!sizeId) {
      return new NextResponse('Size id is required', { status: 400 })
    }

    const size = await prismadb.size.findUnique({
      where: {
        id: sizeId,
      },
    })

    return NextResponse.json(size)
  } catch (error: unknown) {
    console.log('🚀 ~ [SIZE_GET] ~ error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; sizeId: string }> }
) {
  try {
    const { userId } = getAuth(req)
    const { storeId, sizeId } = await params

    const { name, value } = await req.json()

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    if (!value) {
      return new NextResponse('Value URL is required', { status: 400 })
    }

    if (!sizeId) {
      return new NextResponse('Size id is required', { status: 400 })
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

    const size = await prismadb.size.updateMany({
      where: {
        id: sizeId,
      },
      data: {
        name,
        value,
      },
    })

    return NextResponse.json(size)
  } catch (error: unknown) {
    console.log('🚀 ~ [SIZE_PATCH] ~ error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; sizeId: string }> }
) {
  try {
    const { userId } = getAuth(req)
    const { storeId, sizeId } = await params

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    if (!sizeId) {
      return new NextResponse('Size id is required', { status: 400 })
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

    const size = await prismadb.size.deleteMany({
      where: {
        id: sizeId,
      },
    })

    return NextResponse.json(size)
  } catch (error: unknown) {
    console.log('🚀 ~ [SIZE_DELETE] ~ error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
