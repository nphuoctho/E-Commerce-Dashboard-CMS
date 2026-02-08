'use client'

import CardUpload from '@/components/file-upload/card-upload'
import AlertModal from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import Heading from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { FileMetadata } from '@/hooks/use-file-upload'
import { Billboard, Image } from '@/lib/generated/prisma/client'
import { convertBlobUrlsToBase64, getBase64Size } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'

const formSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  image: z.string().min(1, 'Image is required'),
})

type SerializedBillboard = Billboard & {
  image?: Image
}

interface BillboardFormProps {
  initialData: SerializedBillboard | null
  defaultImage?: FileMetadata
}

type BillboardFormValues = z.infer<typeof formSchema>

const BillboardForm: FC<BillboardFormProps> = ({ initialData, defaultImage }) => {
  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const title = initialData ? 'Edit billboard' : 'Create billboard'
  const description = initialData ? 'Edit a billboard' : 'Add a new billboard'
  const toastMessage = initialData ? 'Billboard updated' : 'Billboard created'
  const action = initialData ? 'Save changes' : 'Create'

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          label: initialData.label,
          image: initialData.image?.url || '',
        }
      : {
          label: '',
          image: '',
        },
  })

  const onSubmit = async (data: BillboardFormValues) => {
    try {
      setLoading(true)

      const MAX_SIZE = 5 * 1024 * 1024
      if (data.image.startsWith('data:') && getBase64Size(data.image) > MAX_SIZE) {
        toast.error('Image exceeds 5MB limit', { id: 'upload-process' })
        return
      }

      toast.loading('Preparing image...', { id: 'upload-process' })
      const [base64Image] = await convertBlobUrlsToBase64([data.image], {
        timeout: 30000,
      })

      const submitData = {
        ...data,
        image: base64Image,
      }

      if (base64Image.startsWith('data:')) {
        toast.loading('Uploading image...', { id: 'upload-process' })
      }

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, submitData, {
          timeout: 60000,
        })
      } else {
        await axios.post(`/api/${params.storeId}/billboards/`, submitData, {
          timeout: 60000,
        })
      }

      toast.success(toastMessage, { id: 'upload-process' })

      if (data.image.startsWith('blob:')) {
        URL.revokeObjectURL(data.image)
      }

      router.push(`/${params.storeId}/billboards`)
      router.refresh()
    } catch (error: unknown) {
      console.log('🚀 ~ [Billboard Form] onSubmit ~ error:', error)
      toast.error('Something went wrong.', { id: 'upload-process' })
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`)
      toast.success('Billboard deleted.')
      router.push(`/${params.storeId}/billboards`)
      router.refresh()
    } catch {
      toast.error('Make sure you removed all categories using this billboard first.')
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
      <div className='flex items-center justify-between'>
        <Heading title={title} description={description} />

        {initialData && (
          <Button
            disabled={loading}
            variant='destructive'
            size='icon'
            onClick={() => setOpen(true)}
          >
            <Trash className='size-4' />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 w-full'>
          <FormField
            control={form.control}
            name='image'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Image</FormLabel>
                <FormControl>
                  <CardUpload
                    multiple={false}
                    maxFiles={1}
                    loading={loading}
                    defaultValues={defaultImage ? [defaultImage] : []}
                    onFilesChange={(images) => {
                      field.onChange(images[0]?.preview || '')
                    }}
                  />
                </FormControl>
                <div className='h-6 mt-1'>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <div className='grid grid-cols-3 gap-8'>
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder='Billboard label' {...field} />
                  </FormControl>
                  <div className='h-6 mt-1'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className='ml-auto' type='submit'>
            {action}
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  )
}

export default BillboardForm
