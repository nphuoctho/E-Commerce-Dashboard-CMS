'use client'

import ApiList from '@/components/ui/api-list'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import Heading from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FC } from 'react'
import { BillboardColumn, columns } from './columns'

interface BillboardClientProps {
  data: BillboardColumn[]
}

const BillboardClient: FC<BillboardClientProps> = ({ data }) => {
  const params = useParams()

  return (
    <>
      <div className='flex items-center justify-between'>
        <Heading
          title={`Billboards (${data.length})`}
          description='Manage billboards for your store'
        />

        <Link href={`/${params.storeId}/billboards/new`}>
          <Button>
            <Plus className='mr-2 size-4' />
            Add New
          </Button>
        </Link>
      </div>
      <Separator />
      <DataTable searchKey='label' columns={columns} data={data} />
      <Heading title='API' description='API calls for Billboards' />
      <Separator />
      <ApiList entityName='billboards' entityIdName='billboardId' />
    </>
  )
}

export default BillboardClient
