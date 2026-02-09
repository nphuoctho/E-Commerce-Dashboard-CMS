import AlertModal from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import axios from 'axios'
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { FC, useState } from 'react'
import toast from 'react-hot-toast'
import { OrderColumn } from './columns'

interface CellActionProps {
  data: OrderColumn
}

const CellAction: FC<CellActionProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  const [loading, setLoading] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success('Color Id copied to the clipboard.')
  }

  const onUpdate = () => {
    router.push(`/${params.storeId}/colors/${data.id}`)
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/colors/${data.id}`)
      toast.success('Color deleted.')
      router.refresh()
    } catch {
      toast.error('Make sure you removed all products using this colors first.')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='size-8 p-0'>
            <span className='sr-only'>Open Menu</span>
            <MoreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className='mr-2 size-4' />
            Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onUpdate}>
            <Edit className='mr-2 size-4' />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className='mr-2 size-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default CellAction
