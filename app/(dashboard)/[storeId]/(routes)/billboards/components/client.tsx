'use client'

import { Button } from '@/components/ui/button'
import Heading from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Billboard } from '@/lib/generated/prisma/client'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FC } from 'react'

interface BillboardClientProps {
  data: Billboard[]
}

const BillboardClient: FC<BillboardClientProps> = ({ data }) => {
  const params = useParams()

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Billboards (${data.length})`}
          description="Manage billboards for your store"
        />

        <Link href={`/${params.storeId}/billboards/new`}>
          <Button>
            <Plus className="mr-2 size-4" />
            Add New
          </Button>
        </Link>
      </div>
      <Separator />
    </>
  )
}

export default BillboardClient
