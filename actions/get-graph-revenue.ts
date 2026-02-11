import prismadb from '@/lib/prismadb'

interface GraphData {
  name: string
  total: number
}

export const getGraphRevenue = async (storeId: string) => {
  const monthlyRevenue = await prismadb.$queryRaw<Array<{ month: number; total: number }>>`
    SELECT
      EXTRACT(MONTH FROM o."createdAt")::INTEGER - 1 as month,
      COALESCE(SUM(p.price), 0) as total
    FROM "Order" o
    JOIN "OrderItem" oi ON o.id = oi."orderId"
    JOIN "Product" p ON oi."productId" = p.id
    WHERE o."storeId" = ${storeId} AND o."isPaid" = true
    GROUP BY EXTRACT(MONTH FROM o."createdAt") 
   `

  const graphData: GraphData[] = [
    { name: 'Jan', total: 0 },
    { name: 'Feb', total: 0 },
    { name: 'Mar', total: 0 },
    { name: 'Apr', total: 0 },
    { name: 'May', total: 0 },
    { name: 'Jun', total: 0 },
    { name: 'Jul', total: 0 },
    { name: 'Aug', total: 0 },
    { name: 'Sep', total: 0 },
    { name: 'Oct', total: 0 },
    { name: 'Nov', total: 0 },
    { name: 'Dec', total: 0 },
  ]

  monthlyRevenue.forEach((row) => {
    graphData[row.month].total = Number(row.total)
  })

  return graphData
}
