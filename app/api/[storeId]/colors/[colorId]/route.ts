import prismadb from '@/lib/prismadb'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ colorId: string }> }) {
  try {
    const { colorId } = await params

    if (!colorId) {
      return new NextResponse('Color id is required', { status: 400 })
    }

    const color = await prismadb.color.findUnique({
      where: {
        id: colorId,
      },
    })

    return NextResponse.json(color)
  } catch (error: unknown) {
    console.log('🚀 ~ [COLOR_GET] ~ error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; colorId: string }> }
) {
  try {
    const { userId } = getAuth(req)
    const { storeId, colorId } = await params

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

    if (!colorId) {
      return new NextResponse('Color id is required', { status: 400 })
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

    const color = await prismadb.color.updateMany({
      where: {
        id: colorId,
      },
      data: {
        name,
        value,
      },
    })

    return NextResponse.json(color)
  } catch (error: unknown) {
    console.log('🚀 ~ [COLOR_PATCH] ~ error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; colorId: string }> }
) {
  try {
    const { userId } = getAuth(req)
    const { storeId, colorId } = await params

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    if (!colorId) {
      return new NextResponse('Color id is required', { status: 400 })
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

    const color = await prismadb.color.deleteMany({
      where: {
        id: colorId,
      },
    })

    return NextResponse.json(color)
  } catch (error: unknown) {
    console.log('🚀 ~ [COLOR_DELETE] ~ error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
