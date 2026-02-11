import prismadb from '@/lib/prismadb'

export const getTotalRevenue = async (storeId: string) => {
  const result = await prismadb.$queryRaw<
    [{ total: number }]
  >`SELECT COALESCE(SUM(p.price), 0) as total FROM "Order" o JOIN "OrderItem" oi On o.id = oi."orderId" JOIN "Product" p ON oi."productId" = p.id WHERE o."storeId" = ${storeId} AND o."isPaid" = true`

  return Number(result[0]?.total || 0)
}
