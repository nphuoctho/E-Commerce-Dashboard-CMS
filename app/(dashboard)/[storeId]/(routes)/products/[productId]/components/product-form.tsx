'use client'

import AlertModal from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import Heading from '@/components/ui/heading'
import ImageUpload from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Image, Product } from '@/lib/generated/prisma/client'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'

const formSchema = z.object({
  name: z.string().min(1),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1),
  categoryId: z.string().min(1),
  colorId: z.string().min(1),
  sizeId: z.string().min(1),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
})

interface ProductFormProps {
  initialData:
    | (Product & {
        images: Image[]
      })
    | null
}

type ProductFormValues = z.infer<typeof formSchema>

const ProductForm: FC<ProductFormProps> = ({ initialData }) => {
  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const title = initialData ? 'Edit product' : 'Create product'
  const description = initialData ? 'Edit a product' : 'Add a new product'
  const toastMessage = initialData ? 'Product updated' : 'Product created'
  const action = initialData ? 'Save changes' : 'Create'

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          images: initialData.images?.map((img) => ({ url: img.url })) || [],
          price:
            typeof initialData.price === 'object' && 'toNumber' in initialData.price
              ? initialData.price.toNumber()
              : Number(initialData.price),
          categoryId: initialData.categoryId,
          colorId: initialData.colorId,
          sizeId: initialData.sizeId,
          isFeatured: initialData.isFeatured,
          isArchived: initialData.isArchived,
        }
      : {
          name: '',
          images: [],
          price: 0,
          colorId: '',
          sizeId: '',
          isFeatured: false,
          isArchived: false,
        },
  })

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true)

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data)
      } else {
        await axios.post(`/api/${params.storeId}/products/`, data)
      }

      router.refresh()
      router.push(`/${params.storeId}/products`)
      toast.success(toastMessage)
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`)
      toast.success('Product deleted.')
      router.push(`/${params.storeId}/products`)
      router.refresh()
    } catch {
      toast.error('Make sure you removed all categories using this product first.')
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
            name='imageUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={loading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange('')}
                  />
                </FormControl>
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
                    <Input disabled={loading} placeholder='Product label' {...field} />
                  </FormControl>
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

export default ProductForm
