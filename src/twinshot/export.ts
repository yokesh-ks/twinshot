import { renderComparison } from "./render"
import { MAX_OUTPUT_DIMENSION, type AssetMap, type ComparisonProject } from "./types"

export class ExportError extends Error {}

export function exportFilename(project: ComparisonProject): string {
  const ext = project.output.format === "jpeg" ? "jpg" : "png"
  return `twinshot-${project.output.width}x${project.output.height}.${ext}`
}

export async function renderToBlob(project: ComparisonProject, assets: AssetMap): Promise<Blob> {
  const { width, height, format, quality } = project.output
  if (width > MAX_OUTPUT_DIMENSION || height > MAX_OUTPUT_DIMENSION) {
    throw new ExportError(`Output is larger than ${MAX_OUTPUT_DIMENSION}px. Try a smaller output size.`)
  }
  await document.fonts.ready

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx || canvas.width !== width || canvas.height !== height) {
    throw new ExportError("Your browser couldn't create an image this large. Try a smaller output size.")
  }

  try {
    renderComparison(ctx, project, assets, width, height, { forceOpaque: format === "jpeg" })
  } catch {
    throw new ExportError("Rendering failed. Try a smaller output size.")
  }

  const mime = format === "jpeg" ? "image/jpeg" : "image/png"
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, format === "jpeg" ? quality : undefined)
  )
  canvas.width = 0
  canvas.height = 0
  if (!blob || blob.size === 0) {
    throw new ExportError("The browser couldn't encode the image. Try a smaller output size.")
  }
  return blob
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
