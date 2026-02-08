'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  FileMetadata,
  formatBytes,
  useFileUpload,
  type FileWithPreview,
} from '@/hooks/use-file-upload'
import { cn } from '@/lib/utils'
import { ImageIcon, RefreshCwIcon, Trash2, TriangleAlert, Upload, XIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

// Extend FileWithPreview to include upload status and progress
export interface ImageUploadItem extends FileWithPreview {
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

interface CardUploadProps {
  maxFiles?: number
  maxSize?: number
  multiple?: boolean
  loading?: boolean
  className?: string
  defaultValues?: FileMetadata[]
  onFilesChange?: (files: ImageUploadItem[]) => void
  simulateUpload?: boolean
}

export default function CardUpload({
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024,
  multiple = true,
  loading = false,
  className,
  defaultValues,
  onFilesChange,
  simulateUpload = true,
  ...props
}: CardUploadProps) {
  const defaultImages: FileMetadata[] = defaultValues || []

  // Convert default images to ImageUploadItem format
  const defaultUploadImages: ImageUploadItem[] = defaultImages.map((image) => ({
    id: image.id,
    file: {
      id: image.id,
      name: image.name,
      size: image.size,
      type: image.type,
    } as unknown as File,
    preview: image.url,
    progress: 100,
    status: 'completed' as const,
  }))

  const [uploadImages, setUploadImages] = useState<ImageUploadItem[]>(defaultUploadImages)

  const [
    { isDragging, errors },
    {
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept: 'image/*',
    multiple,
    initialFiles: defaultImages,
    onFilesChange: (newImages) => {
      // Convert to upload items when files change, preserving existing status
      const newUploadImages = newImages.map((image) => {
        // Check if this file already exists in uploadFiles
        const existingImage = uploadImages.find((existing) => existing.id === image.id)

        if (existingImage) {
          // Preserve existing file status and progress
          return {
            ...existingImage,
            ...image, // Update any changed properties from the file
          }
        } else {
          // New file - set to uploading
          return {
            ...image,
            progress: 0,
            status: 'uploading' as const,
          }
        }
      })

      setUploadImages(newUploadImages)
    },
  })

  useEffect(() => {
    onFilesChange?.(uploadImages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadImages])

  // Simulate upload progress for new files
  useEffect(() => {
    if (!simulateUpload) return

    const uploadingFiles = uploadImages.filter((file) => file.status === 'uploading')
    if (uploadingFiles.length === 0) return

    const interval = setInterval(() => {
      setUploadImages((prev) =>
        prev.map((file) => {
          if (file.status !== 'uploading') return file

          const increment = Math.random() * 20 + 5 // Random increment between 5-25%
          const newProgress = Math.min(file.progress + increment, 100)

          if (newProgress >= 100) {
            // Simulate occasional failures (10% chance)
            const shouldFail = Math.random() < 0.1
            return {
              ...file,
              progress: 100,
              status: shouldFail ? ('error' as const) : ('completed' as const),
              error: shouldFail ? 'Upload failed. Please try again.' : undefined,
            }
          }

          return { ...file, progress: newProgress }
        })
      )
    }, 500)

    return () => clearInterval(interval)
  }, [uploadImages, simulateUpload])

  const removeUploadImage = (fileId: string) => {
    const fileToRemove = uploadImages.find((f) => f.id === fileId)
    if (fileToRemove) {
      removeFile(fileToRemove.id)
    }
  }

  const retryUpload = (fileId: string) => {
    setUploadImages((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? { ...file, progress: 0, status: 'uploading' as const, error: undefined }
          : file
      )
    )
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed p-8 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/10 scale-105'
            : 'border-muted-foreground/30 bg-muted/30 hover:border-primary/50 hover:bg-primary/5',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
        {...props}
      >
        <input {...getInputProps()} className='sr-only' />

        <div className='flex flex-col items-center gap-4'>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors border',
              isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
            )}
          >
            <Upload className='h-5 w-5 text-muted-foreground' />
          </div>

          <div className='space-y-2'>
            <p className='text-sm font-medium'>Upload images</p>
            <p className='text-xs text-muted-foreground'>
              Drag & Drop JPG, PNG, GIF, WebP up to {formatBytes(maxSize)}
            </p>
          </div>

          <Button type='button' onClick={openFileDialog}>
            Browse images
          </Button>
        </div>
      </div>

      {/* Images Grid */}
      {uploadImages.length > 0 && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-medium'>Images ({uploadImages.length})</h3>
            <div className='flex gap-2'>
              <Button type='button' onClick={openFileDialog} variant='outline' size='sm'>
                <ImageIcon />
                Add images
              </Button>
              <Button type='button' onClick={clearFiles} variant='outline' size='sm'>
                <Trash2 />
                Remove all
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
            {uploadImages.map((imageItem) => (
              <div key={imageItem.id} className='relative group'>
                {/* Remove button */}
                <Button
                  onClick={() => removeUploadImage(imageItem.id)}
                  variant='outline'
                  disabled={loading}
                  size='icon'
                  className={cn(
                    'absolute -end-2 -top-2 z-10 size-6 rounded-full opacity-0 transition-opacity',
                    {
                      'group-hover:opacity-100': !loading,
                    }
                  )}
                >
                  <XIcon className='size-3' />
                </Button>

                {/* Wrapper */}
                <div className='relative overflow-hidden rounded-lg border bg-card transition-colors'>
                  {/* Image preview area */}
                  <div className='relative aspect-square bg-muted border-b border-border'>
                    {imageItem.preview ? (
                      <>
                        {/* Image cover */}
                        <Image
                          width={120}
                          height={120}
                          src={imageItem.preview}
                          alt={imageItem.file.name}
                          className='h-full w-full object-cover'
                        />
                        {/* Progress overlay for uploading images */}
                        {imageItem.status === 'uploading' && (
                          <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                            <div className='relative'>
                              <svg className='size-12 -rotate-90' viewBox='0 0 48 48'>
                                <circle
                                  cx='24'
                                  cy='24'
                                  r='20'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='3'
                                  className='text-muted/60'
                                />
                                <circle
                                  cx='24'
                                  cy='24'
                                  r='20'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='3'
                                  strokeDasharray={`${2 * Math.PI * 20}`}
                                  strokeDashoffset={`${
                                    2 * Math.PI * 20 * (1 - imageItem.progress / 100)
                                  }`}
                                  className='text-white transition-all duration-300'
                                  strokeLinecap='round'
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Fallback icon if preview is not available */
                      <div className='flex h-full items-center justify-center text-muted-foreground/80'>
                        <ImageIcon className='size-12' />
                      </div>
                    )}
                  </div>

                  {/* Image info footer */}
                  <div className='p-3'>
                    <div className='space-y-1'>
                      <p className='truncate text-sm font-medium'>{imageItem.file.name}</p>
                      <div className='relative flex items-center justify-between gap-2'>
                        <span className='text-xs text-muted-foreground'>
                          {formatBytes(imageItem.file.size)}
                        </span>

                        {imageItem.status === 'error' && imageItem.error && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => retryUpload(imageItem.id)}
                                variant='ghost'
                                size='icon'
                                className='absolute end-0 -top-1.25 size-6 text-destructive hover:bg-destructive/10 hover:text-destructive'
                              >
                                <RefreshCwIcon className='size-3 opacity-100' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Upload failed. Retry</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant='destructive' className='mt-5 items-center'>
          <TriangleAlert className='size-5 text-destructive' />
          <AlertTitle>Image upload error(s)</AlertTitle>
          <AlertDescription>
            {errors.map((error, index) => (
              <p key={index} className='last:mb-0'>
                {error}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
