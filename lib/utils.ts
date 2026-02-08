import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// Convert blob URL to base64
export async function blobUrlToBase64(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl)
  const blob = await response.blob()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Convert multiple blob Urls to base64
export async function convertBlobUrlsToBase64(
  urls: string[],
  options?: {
    timeout?: number
  }
): Promise<string[]> {
  const { timeout = 30000 } = options || {}

  const promise = urls.map((url) => {
    // If already base64 or http URL, return as is
    if (url.startsWith('data:') || url.startsWith('http')) {
      return url
    }

    // Convert blob URL to base64
    if (url.startsWith('blob:')) {
      return Promise.race([
        blobUrlToBase64(url),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
      ])
    }

    return url
  })

  return Promise.all(promise)
}

// Validate file size from base64
export function getBase64Size(base64: string): number {
  const base64Data = base64.split(',')[1] || base64
  const padding = (base64Data.match(/=/g) || []).length
  return (base64Data.length * 3) / 4 - padding
}

export async function compressBase64Image(
  base64: string,
  maxSizeInMB: number = 5
): Promise<string> {
  const currentSize = getBase64Size(base64)
  const maxSize = maxSizeInMB * 1024 * 1024

  if (currentSize <= maxSize) {
    return base64
  }

  return base64
}

// Get image file size from URL
export async function getImageFileSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentLength = response.headers.get('content-length')
    return contentLength ? parseInt(contentLength, 10) : 0
  } catch (error) {
    console.error('Failed to get image file size:', error)
    return 0
  }
}
