'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatter } from '@/lib/utils'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

interface GraphData {
  name: string
  total: number
}

interface OverviewProps {
  data: GraphData[]
}

const chartConfig = {
  total: {
    label: 'Revenue',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

const Overview = ({ data }: OverviewProps) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.total, 0)

  // Tìm tháng hiện tại và tháng trước
  const currentMonth = new Date().getMonth()
  const currentMonthRevenue = data[currentMonth]?.total || 0
  const lastMonthRevenue = data[currentMonth - 1 >= 0 ? currentMonth - 1 : 11]?.total || 0

  // Tính % tăng trưởng
  const percentChange =
    lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  const isPositiveTrend = percentChange >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>
          {data[currentMonth].name} - {new Date().getFullYear()} • Total:{' '}
          {formatter.format(totalRevenue)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey='name' tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatter.format(value)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => formatter.format(value as number)}
                />
              }
            />
            <Bar dataKey='total' fill='var(--color-total)' radius={8}>
              <LabelList
                position='top'
                offset={12}
                className='fill-foreground'
                fontSize={12}
                formatter={(value: number) => (value > 0 ? formatter.format(value) : '')}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm'>
        <div className='flex gap-2 leading-none font-medium'>
          {isPositiveTrend ? (
            <>
              Trending up by {Math.abs(percentChange).toFixed(1)}% this month
              <TrendingUp className='h-4 w-4 text-green-500' />
            </>
          ) : (
            <>
              Trending down by {Math.abs(percentChange).toFixed(1)}% this month
              <TrendingDown className='h-4 w-4 text-red-500' />
            </>
          )}
        </div>
        <div className='text-muted-foreground leading-none'>
          Showing monthly revenue for the entire year
        </div>
      </CardFooter>
    </Card>
  )
}

export default Overview
