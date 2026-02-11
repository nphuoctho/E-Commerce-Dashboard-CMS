import { getGraphRevenue } from '@/actions/get-graph-revenue'
import { getSalesCount } from '@/actions/get-sales-count'
import { getStockCount } from '@/actions/get-stock-count'
import { getTotalRevenue } from '@/actions/get-total-revenue'
import Overview from '@/components/overview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Heading from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { formatter } from '@/lib/utils'
import { CreditCard, DollarSign, Package } from 'lucide-react'
import { FC } from 'react'

interface DashboardPageProps {
  params: Promise<{ storeId: string }>
}

const DashboardPage: FC<DashboardPageProps> = async ({ params }) => {
  const { storeId } = await params

  const totalRevenue = await getTotalRevenue(storeId)
  const salesCount = await getSalesCount(storeId)
  const stockCount = await getStockCount(storeId)
  const graphRevenue = await getGraphRevenue(storeId)

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <Heading title='Dashboard' description='Overview of your store' />
        <Separator />
        <div className='grid gap-4 grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
              <DollarSign className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>{formatter.format(totalRevenue)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='text-sm font-medium'>Sales</CardTitle>
              <CreditCard className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>+{salesCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='text-sm font-medium'>Products in Stock</CardTitle>
              <Package className='size-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>+{stockCount}</p>
            </CardContent>
          </Card>
        </div>

        <Overview data={graphRevenue} />
      </div>
    </div>
  )
}

export default DashboardPage
