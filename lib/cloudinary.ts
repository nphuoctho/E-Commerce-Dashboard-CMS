import { v2 as cloudinary, UploadApiOptions } from 'cloudinary'

// const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const CLOUDINARY_CONFIG = {
  maxSizeInMb: 5,
  allowedFormats: ['jpeg', 'jpg', 'png', 'webp'],
} as const

export interface CloudinaryUploadResult {
  url: string
  secure_url: string
  publicId: string
  fileName: string
  bytes: number
  width?: number
  height?: number
  format: string
}

// Upload image to Cloudinary
export async function uploadToCloudinary(
  imageData: string,
  options?: UploadApiOptions & { storeId?: string }
): Promise<CloudinaryUploadResult> {
  const formatMatch = imageData.match(/^data:image\/(\w+);base64,/)
  const detectedFormat = formatMatch ? formatMatch[1] : 'png'

  if (
    !CLOUDINARY_CONFIG.allowedFormats.includes(
      detectedFormat as (typeof CLOUDINARY_CONFIG.allowedFormats)[number]
    )
  ) {
    throw new Error(
      `Invalid image format: ${detectedFormat}. Allowed formats: ${CLOUDINARY_CONFIG.allowedFormats.join(
        ', '
      )}`
    )
  }

  const folderPath = `ecom-admin/stores/${options?.storeId}/${options?.folder}`

  const result = await cloudinary.uploader.upload(imageData, {
    folder: folderPath,
    allowed_formats: [...CLOUDINARY_CONFIG.allowedFormats],
    resource_type: 'image',
    transformation: options?.transformation,
  })

  return {
    url: result.url,
    secure_url: result.secure_url,
    fileName: result.display_name,
    bytes: result.bytes,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  }
}

// Delete image from Cloudinary
export async function deleteFromCloudinary(publicId: string) {
  await cloudinary.uploader.destroy(publicId)
}

//  Delete multiple images from Cloudinary
export async function deleteMultipleFromCloudinary(publicIds: string[]) {
  await cloudinary.api.delete_resources(publicIds)
}

// Extract public ID from Cloudinary URL
export function extractPublicId(url: string): string | null {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const pattern = new RegExp(`https?://res\\.cloudinary\\.com/${cloudName}/image/upload/`)

    if (!pattern.test(url)) return null

    let publicIdWithFolder = url.replace(pattern, '').replace(/^v\d+\//, '')

    const lastDotIndex = publicIdWithFolder.lastIndexOf('.')
    if (lastDotIndex > 0) {
      publicIdWithFolder = publicIdWithFolder.substring(0, lastDotIndex)
    }

    return publicIdWithFolder
  } catch {
    return null
  }
}
