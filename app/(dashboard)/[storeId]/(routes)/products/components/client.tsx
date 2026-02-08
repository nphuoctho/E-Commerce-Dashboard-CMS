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
import { ProductColumn, columns } from './columns'

interface ProductClientProps {
  data: ProductColumn[]
}

const ProductClient: FC<ProductClientProps> = ({ data }) => {
  const params = useParams()

  return (
    <>
      <div className='flex items-center justify-between'>
        <Heading title={`Products (${data.length})`} description='Manage products for your store' />

        <Link href={`/${params.storeId}/products/new`}>
          <Button>
            <Plus className='mr-2 size-4' />
            Add New
          </Button>
        </Link>
      </div>
      <Separator />
      <DataTable searchKey='name' columns={columns} data={data} />
      <Heading title='API' description='API calls for Products' />
      <Separator />
      <ApiList entityName='products' entityIdName='productId' />
    </>
  )
}

export default ProductClient
