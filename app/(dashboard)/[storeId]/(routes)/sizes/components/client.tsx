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
import { SizeColumn, columns } from './columns'

interface SizeClientProps {
  data: SizeColumn[]
}

const SizeClient: FC<SizeClientProps> = ({ data }) => {
  const params = useParams()

  return (
    <>
      <div className='flex items-center justify-between'>
        <Heading title={`Sizes (${data.length})`} description='Manage sizes for your store' />

        <Link href={`/${params.storeId}/sizes/new`}>
          <Button>
            <Plus className='mr-2 size-4' />
            Add New
          </Button>
        </Link>
      </div>
      <Separator />
      <DataTable searchKey='name' columns={columns} data={data} />
      <Heading title='API' description='API calls for Sizes' />
      <Separator />
      <ApiList entityName='sizes' entityIdName='sizeId' />
    </>
  )
}

export default SizeClient
