import prismadb from '@/lib/prismadb'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ billboardId: string }> }
) {
  try {
    const { billboardId } = await params

    if (!billboardId) {
      return new NextResponse('Billboard id is required', { status: 400 })
    }

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: billboardId,
      },
    })

    return NextResponse.json(billboard)
  } catch (error: unknown) {
    console.log('🚀 ~ [BILLBOARD_GET] ~ error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { userId } = getAuth(req)
    const { storeId, billboardId } = await params

    const { label, imageUrl } = await req.json()

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    if (!label) {
      return new NextResponse('Label is required', { status: 400 })
    }

    if (!imageUrl) {
      return new NextResponse('Image URL is required', { status: 400 })
    }

    if (!billboardId) {
      return new NextResponse('Billboard id is required', { status: 400 })
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

    const billboar = await prismadb.billboard.updateMany({
      where: {
        id: billboardId,
      },
      data: {
        label,
        imageUrl,
      },
    })

    return NextResponse.json(billboar)
  } catch (error: unknown) {
    console.log('🚀 ~ [BILLBOARD_PATCH] ~ error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { userId } = getAuth(req)
    const { storeId, billboardId } = await params

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 })
    }

    if (!billboardId) {
      return new NextResponse('Billboard id is required', { status: 400 })
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

    const billboard = await prismadb.billboard.deleteMany({
      where: {
        id: billboardId,
      },
    })

    return NextResponse.json(billboard)
  } catch (error: unknown) {
    console.log('🚀 ~ [BILLBOARD_DELETE] ~ error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
