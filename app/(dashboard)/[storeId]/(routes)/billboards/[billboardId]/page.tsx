import BillboardForm from '@/app/(dashboard)/[storeId]/(routes)/billboards/[billboardId]/components/billboard-form'
import { FileMetadata } from '@/hooks/use-file-upload'
import prismadb from '@/lib/prismadb'
import { FC } from 'react'

interface BillboardPageProps {
  params: Promise<{ billboardId: string }>
}

const BillboardPage: FC<BillboardPageProps> = async ({ params }) => {
  const { billboardId } = await params

  const billboard = await prismadb.billboard.findUnique({
    where: {
      id: billboardId,
    },
    include: {
      image: true,
    },
  })

  const defaultImage: FileMetadata | undefined = billboard?.image
    ? {
        id: billboard?.image.publicId || '',
        name: billboard?.image.name || '',
        url: billboard?.image.url || '',
        type: `image/${billboard?.image.format}`,
        size: billboard?.image.size || 0,
      }
    : undefined

  const serializedBillboard = billboard
    ? { ...billboard, image: billboard.image || undefined }
    : null

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <BillboardForm initialData={serializedBillboard} defaultImage={defaultImage} />
      </div>
    </div>
  )
}

export default BillboardPage
