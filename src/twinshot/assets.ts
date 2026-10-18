export interface Asset {
  id: string
  name: string
  original: Blob
  bitmap: ImageBitmap | HTMLCanvasElement
  width: number
  height: number
}

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
export const ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
const WORKING_MAX = 6144

export class AssetError extends Error {}

export function validateFile(file: Blob): void {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new AssetError("Unsupported file. Please use a JPG, PNG, or WebP image.")
  }
}

export async function loadAsset(file: File | Blob): Promise<Asset> {
  validateFile(file)
  let source: ImageBitmap | HTMLImageElement
  try {
    source = await createImageBitmap(file, { imageOrientation: "from-image" })
  } catch {
    source = await decodeWithImage(file)
  }
  const w = source.width
  const h = source.height
  if (!w || !h) throw new AssetError("This image could not be read. It may be corrupt.")

  let bitmap: ImageBitmap | HTMLCanvasElement
  const longEdge = Math.max(w, h)
  if (longEdge > WORKING_MAX || source instanceof HTMLImageElement) {
    const ratio = Math.min(1, WORKING_MAX / longEdge)
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(w * ratio)
    canvas.height = Math.round(h * ratio)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new AssetError("Your browser ran out of memory decoding this image.")
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
    if ("close" in source) source.close()
    bitmap = canvas
  } else {
    bitmap = source
  }

  return {
    id: crypto.randomUUID(),
    name: file instanceof File ? file.name : "pasted-image",
    original: file,
    bitmap,
    width: bitmap.width,
    height: bitmap.height,
  }
}

function decodeWithImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new AssetError("This image could not be read. It may be corrupt."))
    }
    img.src = url
  })
}

export function disposeAsset(asset: Asset): void {
  if ("close" in asset.bitmap) asset.bitmap.close()
  else {
    asset.bitmap.width = 0
    asset.bitmap.height = 0
  }
}
