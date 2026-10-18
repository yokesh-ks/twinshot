import type { ComparisonProject, Fit, LabelPosition, Side } from "./types"

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface DrawPlan {
  src: Rect
  dst: Rect
}

export interface LayoutGeometry {
  regions: Record<Side, Rect>
  divider: Rect | null
}

export function computeLayout(project: ComparisonProject, width: number, height: number, scale = 1): LayoutGeometry {
  const pad = Math.max(0, project.style.padding * scale)
  const gap = Math.max(0, project.style.gap * scale)
  const innerW = Math.max(1, width - pad * 2)
  const innerH = Math.max(1, height - pad * 2)
  const { divider } = project.style
  const dividerW = divider.enabled ? Math.max(0, divider.width * scale) : 0

  let before: Rect
  let after: Rect
  let dividerRect: Rect | null = null

  if (project.layout === "side-by-side") {
    const regionW = Math.max(1, (innerW - gap) / 2)
    before = { x: pad, y: pad, w: regionW, h: innerH }
    after = { x: pad + regionW + gap, y: pad, w: regionW, h: innerH }
    if (dividerW > 0) {
      const cx = pad + regionW + gap / 2
      dividerRect = { x: cx - dividerW / 2, y: pad, w: dividerW, h: innerH }
    }
  } else {
    const regionH = Math.max(1, (innerH - gap) / 2)
    before = { x: pad, y: pad, w: innerW, h: regionH }
    after = { x: pad, y: pad + regionH + gap, w: innerW, h: regionH }
    if (dividerW > 0) {
      const cy = pad + regionH + gap / 2
      dividerRect = { x: pad, y: cy - dividerW / 2, w: innerW, h: dividerW }
    }
  }

  return { regions: { before, after }, divider: dividerRect }
}

export function computeImagePlan(
  imgW: number,
  imgH: number,
  region: Rect,
  fit: Fit,
  focalX: number,
  focalY: number
): DrawPlan {
  const imgRatio = imgW / imgH
  const regionRatio = region.w / region.h

  if (fit === "contain") {
    let w = region.w
    let h = region.h
    if (imgRatio > regionRatio) h = w / imgRatio
    else w = h * imgRatio
    return {
      src: { x: 0, y: 0, w: imgW, h: imgH },
      dst: { x: region.x + (region.w - w) / 2, y: region.y + (region.h - h) / 2, w, h },
    }
  }

  let sw = imgW
  let sh = imgH
  if (imgRatio > regionRatio) sw = imgH * regionRatio
  else sh = imgW / regionRatio
  const fx = clamp01(focalX)
  const fy = clamp01(focalY)
  return {
    src: { x: (imgW - sw) * fx, y: (imgH - sh) * fy, w: sw, h: sh },
    dst: { ...region },
  }
}

export function labelAnchor(
  position: LabelPosition,
  region: Rect,
  boxW: number,
  boxH: number,
  margin: number
): { x: number; y: number } {
  const [v, hz] = position.split("-") as ["top" | "bottom", "left" | "center" | "right"]
  const x =
    hz === "left"
      ? region.x + margin
      : hz === "right"
        ? region.x + region.w - margin - boxW
        : region.x + (region.w - boxW) / 2
  const y = v === "top" ? region.y + margin : region.y + region.h - margin - boxH
  return { x, y }
}

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0.5))
}
