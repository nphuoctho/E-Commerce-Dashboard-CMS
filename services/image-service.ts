import {
  CloudinaryUploadResult,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  extractPublicId,
  uploadToCloudinary,
} from '@/lib/cloudinary'

export interface ImageUploadOptions {
  folder?: string
  maxSizeInMb?: number
  allowedFormats?: string[]
}

export interface ImageServiceResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Validata image data
function validateImageData(imageData: string, options?: ImageUploadOptions): string | null {
  // Check if base64
  if (!imageData.startsWith('data:image/')) {
    return 'Invalid image format'
  }

  // Check file size (base64 is ~33% larger than binary)
  const maxSize = (options?.maxSizeInMb || 5) * 1024 * 1024 * 1.33
  const sizeInBytes = (imageData.length * 3) / 4

  if (sizeInBytes > maxSize) {
    return `Image size exceeds ${options?.maxSizeInMb || 5}MB`
  }

  // Check format
  const allowedFormats = options?.allowedFormats || ['jpeg', 'jpg', 'png', 'webp']
  const format = imageData.split(';')[0].split('/')[1]

  if (!allowedFormats.includes(format)) {
    return `Image format must be one of: ${allowedFormats.join(', ')}`
  }

  return null
}

// Upload simple image
export async function uploadImage(
  imageData: string,
  options?: ImageUploadOptions
): Promise<ImageServiceResult<CloudinaryUploadResult>> {
  try {
    // Validate
    const validateError = validateImageData(imageData, options)
    if (validateError) {
      return {
        success: false,
        error: validateError,
      }
    }

    // Upload
    const result = await uploadToCloudinary(imageData, {
      folder: options?.folder,
    })

    return { success: true, data: result }
  } catch (error: unknown) {
    console.log('🚀 ~ [IMAGE_SERVICE_UPLOAD] ~ error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    }
  }
}

// Upload multiple images
export async function uploadMultipleImages(
  imagesData: string[],
  options?: ImageUploadOptions
): Promise<ImageServiceResult<CloudinaryUploadResult[]>> {
  try {
    // Validate all images
    for (const imageData of imagesData) {
      const validationError = validateImageData(imageData, options)
      if (validationError) {
        return { success: false, error: validationError }
      }
    }

    // Upload all images
    const uploadPromises = imagesData.map((imageData) =>
      uploadToCloudinary(imageData, { folder: options?.folder })
    )

    const results = await Promise.all(uploadPromises)

    return { success: true, data: results }
  } catch (error: unknown) {
    console.log('🚀 ~ [IMAGE_SERVICE_UPLOAD_MULTIPLE] ~ error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload images',
    }
  }
}

// Delete image by URL or public ID
export async function deleteImage(urlOrPublicId: string): Promise<ImageServiceResult> {
  try {
    // Extract public ID if URL is provided
    const publicId = urlOrPublicId.startsWith('http')
      ? extractPublicId(urlOrPublicId)
      : urlOrPublicId

    if (!publicId) {
      return { success: false, error: 'Invalid image URL or public ID' }
    }

    await deleteFromCloudinary(publicId)

    return { success: true }
  } catch (error: unknown) {
    console.log('🚀 ~ [IMAGE_SERVICE_DELETE] ~ error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    }
  }
}

// Delete multiple images
export async function deleteMultipleImages(urlOrPublicIds: string[]): Promise<ImageServiceResult> {
  try {
    // Extract public ID if URL is provided
    const publicIds = urlOrPublicIds
      .map((item) => (item.startsWith('http') ? extractPublicId(item) : item))
      .filter((id): id is string => id !== null)

    if (publicIds.length === 0) {
      return { success: false, error: 'No valid images to delete' }
    }

    await deleteMultipleFromCloudinary(publicIds)

    return { success: true }
  } catch (error: unknown) {
    console.log('🚀 ~ [IMAGE_SERVICE_DELETE_MULTIPLE] ~ error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete images',
    }
  }
}

// Update image (delete old, upload new)
export async function updateImage(
  oldUrlOrPublicId: string | null,
  newImageData: string,
  options: ImageUploadOptions
): Promise<ImageServiceResult<CloudinaryUploadResult>> {
  try {
    // Upload new image first
    const uploadResult = await uploadImage(newImageData, options)

    if (!uploadResult.success) {
      return uploadResult
    }

    // Delete old image
    if (oldUrlOrPublicId) {
      await deleteImage(oldUrlOrPublicId).catch((error) => {
        console.log('🚀 ~ [IMAGE_SERVICE_UPDATE] Failed to delete old image:', error)
      })
    }

    return uploadResult
  } catch (error: unknown) {
    console.log('🚀 ~ [IMAGE_SERVICE_UPDATE] ~ error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update images',
    }
  }
}
