import { computeImagePlan, computeLayout, labelAnchor, type Rect } from "./layout"
import { fontCss, type AssetMap, type ComparisonProject, type LabelStyle, type Side } from "./types"

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

export interface RenderOptions {
  hideOverlays?: boolean
  forceOpaque?: boolean
  placeholderColor?: string
}

export function renderComparison(
  ctx: Ctx,
  project: ComparisonProject,
  assets: AssetMap,
  targetWidth: number,
  targetHeight: number,
  options: RenderOptions = {}
): void {
  const scale = targetWidth / project.output.width
  const geo = computeLayout(project, targetWidth, targetHeight, scale)
  const radius = Math.max(0, project.style.cornerRadius * scale)

  ctx.save()
  ctx.clearRect(0, 0, targetWidth, targetHeight)
  const transparent = project.style.transparentBackground && !options.forceOpaque && project.output.format === "png"
  if (!transparent) {
    ctx.fillStyle = project.style.background
    if (radius > 0 && project.style.padding > 0) {
      roundRectPath(ctx, { x: 0, y: 0, w: targetWidth, h: targetHeight }, radius)
      ctx.fill()
    } else {
      ctx.fillRect(0, 0, targetWidth, targetHeight)
    }
  }

  for (const side of ["before", "after"] as Side[]) {
    const region = geo.regions[side]
    const placement = project.images[side]
    const asset = placement.assetId ? assets[placement.assetId] : undefined
    ctx.save()
    roundRectPath(ctx, region, radius)
    ctx.clip()
    if (asset) {
      const plan = computeImagePlan(asset.width, asset.height, region, placement.fit, placement.focalX, placement.focalY)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(asset, plan.src.x, plan.src.y, plan.src.w, plan.src.h, plan.dst.x, plan.dst.y, plan.dst.w, plan.dst.h)
    } else if (options.placeholderColor) {
      ctx.fillStyle = options.placeholderColor
      ctx.fillRect(region.x, region.y, region.w, region.h)
    }
    ctx.restore()
  }

  if (geo.divider) {
    ctx.fillStyle = project.style.divider.color
    ctx.fillRect(geo.divider.x, geo.divider.y, geo.divider.w, geo.divider.h)
  }

  if (!options.hideOverlays) {
    for (const side of ["before", "after"] as Side[]) {
      drawLabel(ctx, project.labels[side], geo.regions[side], scale)
    }
    const logo = project.logo.assetId ? assets[project.logo.assetId] : undefined
    if (logo) drawLogo(ctx, project, logo, targetWidth, targetHeight, scale)
  }
  ctx.restore()
}

function drawLabel(ctx: Ctx, label: LabelStyle, region: Rect, scale: number) {
  const text = label.text.trim()
  if (!text) return
  const size = Math.max(1, label.fontSize * scale)
  const padX = size * 0.45
  const padY = size * 0.28
  const margin = size * 0.5
  ctx.font = `${label.fontWeight} ${size}px "${fontCss(label.fontFamily)}", sans-serif`
  ctx.textBaseline = "middle"
  ctx.textAlign = "left"

  const maxText = Math.max(0, region.w - margin * 2 - padX * 2)
  const shown = truncate(ctx, text, maxText)
  if (!shown) return
  const textW = ctx.measureText(shown).width
  const boxW = textW + padX * 2
  const boxH = size * 1.2 + padY * 2
  const { x, y } = labelAnchor(label.position, region, boxW, boxH, margin)

  ctx.save()
  roundRectPath(ctx, region, 0)
  ctx.clip()
  if (label.backgroundOpacity > 0) {
    ctx.globalAlpha = label.backgroundOpacity
    ctx.fillStyle = label.background
    roundRectPath(ctx, { x, y, w: boxW, h: boxH }, size * 0.22)
    ctx.fill()
    ctx.globalAlpha = 1
  }
  const tx = x + padX
  const ty = y + boxH / 2
  if (label.stroke && label.stroke.width > 0) {
    ctx.lineJoin = "round"
    ctx.strokeStyle = label.stroke.color
    ctx.lineWidth = label.stroke.width * scale * 2
    ctx.strokeText(shown, tx, ty)
  }
  ctx.fillStyle = label.color
  ctx.fillText(shown, tx, ty)
  ctx.restore()
}

function truncate(ctx: Ctx, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  const ellipsis = "\u2026"
  let lo = 0
  let hi = text.length
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (ctx.measureText(text.slice(0, mid) + ellipsis).width <= maxWidth) lo = mid
    else hi = mid - 1
  }
  return lo === 0 ? "" : text.slice(0, lo).trimEnd() + ellipsis
}

function drawLogo(
  ctx: Ctx,
  project: ComparisonProject,
  logo: AssetMap[string],
  width: number,
  height: number,
  scale: number
) {
  const w = Math.max(1, project.logo.widthFraction * width)
  const h = (w * logo.height) / logo.width
  const m = project.logo.margin * scale
  const [v, hz] = project.logo.corner.split("-")
  const x = hz === "left" ? m : width - m - w
  const y = v === "top" ? m : height - m - h
  ctx.drawImage(logo, x, y, w, h)
}

function roundRectPath(ctx: Ctx, r: Rect, radius: number) {
  const rad = Math.min(radius, r.w / 2, r.h / 2)
  ctx.beginPath()
  if (rad <= 0) {
    ctx.rect(r.x, r.y, r.w, r.h)
    return
  }
  ctx.moveTo(r.x + rad, r.y)
  ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, rad)
  ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, rad)
  ctx.arcTo(r.x, r.y + r.h, r.x, r.y, rad)
  ctx.arcTo(r.x, r.y, r.x + r.w, r.y, rad)
  ctx.closePath()
}
