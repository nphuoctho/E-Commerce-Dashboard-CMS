'use client'

import CardUpload from '@/components/file-upload/card-upload'
import AlertModal from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { FileMetadata } from '@/hooks/use-file-upload'
import { Category, Color, Image, Product, Size } from '@/lib/generated/prisma/client'
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
  name: z.string().min(1, 'Product name is required'),
  images: z.string().array().min(1, 'At least one image is required'),
  price: z
    .string()
    .min(1, 'Price is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number (e.g., 9.99)'),
  categoryId: z.string().min(1, 'Please select a category'),
  sizeId: z.string().min(1, 'Please select a size'),
  colorId: z.string().min(1, 'Please select a color'),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
})

type SerializedProduct = Omit<Product, 'price'> & {
  price: string
  images: Image[]
}

interface ProductFormProps {
  initialData: SerializedProduct | null
  defaultImages: FileMetadata[]
  categories: Category[]
  sizes: Size[]
  colors: Color[]
}

export type ProductFormValues = z.infer<typeof formSchema>

const ProductForm: FC<ProductFormProps> = ({
  initialData,
  defaultImages,
  categories,
  sizes,
  colors,
}) => {
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
          images: initialData.images?.map((img) => img.url) || [],
          price: initialData.price.toString(),
          categoryId: initialData.categoryId,
          sizeId: initialData.sizeId,
          colorId: initialData.colorId,
          isFeatured: initialData.isFeatured,
          isArchived: initialData.isArchived,
        }
      : {
          name: '',
          images: [],
          price: '',
          categoryId: '',
          sizeId: '',
          colorId: '',
          isFeatured: false,
          isArchived: false,
        },
  })

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true)

      const MAX_SIZE = 5 * 1024 * 1024
      const oversizedImages = data.images.filter((img) => {
        if (!img.startsWith('data:')) return false
        return getBase64Size(img) > MAX_SIZE
      })

      if (oversizedImages.length > 0) {
        toast.error(`${oversizedImages.length} image(s) exceed 5MB limit`, {
          id: 'upload-process',
        })
        return
      }

      toast.loading('Preparing images...', { id: 'upload-process' })
      const base64Images = await convertBlobUrlsToBase64(data.images, {
        timeout: 30000,
      })

      const submitData = {
        ...data,
        images: base64Images,
      }

      toast.loading(
        `Uploading ${base64Images.filter((img) => img.startsWith('data:')).length} images...`,
        { id: 'upload-process' }
      )

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`, submitData, {
          timeout: 60000,
        })
      } else {
        await axios.post(`/api/${params.storeId}/products/`, submitData, {
          timeout: 60000,
        })
      }

      toast.success(toastMessage, { id: 'upload-process' })

      data.images.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })

      router.push(`/${params.storeId}/products`)
      router.refresh()
    } catch (error: unknown) {
      console.log('🚀 ~ [Product Form] onSubmit ~ error:', error)
      toast.error('Something went wrong.', { id: 'upload-process' })
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
      toast.error('Something went wrong.')
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
            name='images'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Images</FormLabel>
                <FormControl>
                  <CardUpload
                    maxFiles={8}
                    loading={loading}
                    defaultValues={defaultImages}
                    onFilesChange={(images) => {
                      const imageUrls = images.map((image) => image.preview)
                      field.onChange(imageUrls)
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
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder='Product label' {...field} />
                  </FormControl>
                  <div className='h-6 mt-1'>
                    <div className='h-6 mt-1'>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder='9.99' disabled={loading} {...field} />
                  </FormControl>
                  <div className='h-6 mt-1'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue defaultValue={field.value} placeholder='Select a category' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className='h-6 mt-1'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='sizeId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue defaultValue={field.value} placeholder='Select a size' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className='h-6 mt-1'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='colorId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue defaultValue={field.value} placeholder='Select a color' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          {color.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className='h-6 mt-1'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className='grid grid-cols-2 gap-8'>
            <FormField
              control={form.control}
              name='isFeatured'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FieldLabel>
                      <Field orientation='horizontal'>
                        <Checkbox
                          id='toggle-featured'
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldContent>
                          <FieldTitle>Featured</FieldTitle>
                          <FieldDescription>
                            This product will appear on the home page.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='isArchived'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FieldLabel>
                      <Field orientation='horizontal'>
                        <Checkbox
                          id='toggle-archived'
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldContent>
                          <FieldTitle>Archived</FieldTitle>
                          <FieldDescription>
                            This product will not appear anywhere in this store.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
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
