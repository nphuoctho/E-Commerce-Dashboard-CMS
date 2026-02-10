import prismadb from '@/lib/prismadb'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

type StripeAddress = {
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
}

const formatAddress = (address: StripeAddress | null | undefined): string => {
  if (!address) return ''

  const addressComponents = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ].filter((component): component is string => Boolean(component))

  return addressComponents.join(', ')
}

const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  const orderId = session?.metadata?.orderId

  if (!orderId) {
    throw new Error('Order ID not found in session metadata')
  }

  const addressString = formatAddress(session.customer_details?.address)
  const phone = session.customer_details?.phone || ''

  const order = await prismadb.order.update({
    where: { id: orderId },
    data: {
      isPaid: true,
      address: addressString,
      phone,
    },
    include: {
      orderItems: true,
    },
  })

  if (order.orderItems.length > 0) {
    const productIds = order.orderItems.map((orderItem) => orderItem.productId)

    await prismadb.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: {
        isArchived: true,
      },
    })
  }

  return order
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('Stripe-Signature')

    if (!signature) {
      return new NextResponse('Missing Stripe signature', { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured')
      return new NextResponse('Webhook configuration error', { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Webhook signature verification failed:', errorMessage)
      return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    if (event.type === 'checkout.session.completed') {
      await handleCheckoutSessionCompleted(session)
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Webhook processing error:', errorMessage)
    return new NextResponse(`Internal Error: ${errorMessage}`, { status: 500 })
  }
}
