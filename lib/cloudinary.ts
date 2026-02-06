import { v2 as cloudinary, UploadApiOptions } from 'cloudinary'

const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  url: string
  publicId: string
  width?: number
  height?: number
  format: string
}

// Upload image to Cloudinary
export async function uploadToCloudinary(
  imageData: string,
  options?: UploadApiOptions
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(imageData, {
    folder: options?.folder || 'ecom-admin',
    upload_preset: uploadPreset,
    transformation: options?.transformation,
  })

  return {
    url: result.secure_url,
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
    const pattern = `https://res.cloudinary.com/${cloudName}/image/upload/`

    if (!url.startsWith(pattern)) return null

    const publicIdWithExtension = url.replace(pattern, '').replace(/^v\d+\//, '')
    const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.indexOf('.'))

    return publicId
  } catch {
    return null
  }
}
