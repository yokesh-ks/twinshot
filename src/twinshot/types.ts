export type Layout = "side-by-side" | "stacked"
export type Fit = "cover" | "contain"
export type ExportFormat = "png" | "jpeg"
export type LabelPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right"
export type Side = "before" | "after"

export interface ImagePlacement {
  assetId: string | null
  fit: Fit
  focalX: number
  focalY: number
}

export interface LabelStyle {
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: 400 | 500 | 700
  color: string
  background: string
  backgroundOpacity: number
  stroke: { color: string; width: number } | null
  position: LabelPosition
}

export interface LogoPlacement {
  assetId: string | null
  widthFraction: number
  corner: Corner
  margin: number
}

export interface ComparisonProject {
  version: 1
  layout: Layout
  images: { before: ImagePlacement; after: ImagePlacement }
  labels: { before: LabelStyle; after: LabelStyle }
  style: {
    background: string
    transparentBackground: boolean
    padding: number
    gap: number
    divider: { enabled: boolean; color: string; width: number }
    cornerRadius: number
  }
  logo: LogoPlacement
  output: {
    width: number
    height: number
    format: ExportFormat
    quality: number
  }
}

export type AssetMap = Record<string, CanvasImageSource & { width: number; height: number }>

export const FONTS = [
  { id: "inter", label: "Inter (Sans)", css: "Inter", weights: [400, 500, 700] },
  { id: "lora", label: "Lora (Serif)", css: "Lora", weights: [400, 500, 700] },
  { id: "jetbrains-mono", label: "JetBrains Mono", css: "JetBrains Mono", weights: [400, 500, 700] },
] as const

export function fontCss(id: string): string {
  return FONTS.find((f) => f.id === id)?.css ?? "Inter"
}

export const ASPECT_PRESETS = [
  { id: "1:1", width: 1600, height: 1600 },
  { id: "4:5", width: 1600, height: 2000 },
  { id: "16:9", width: 1920, height: 1080 },
  { id: "9:16", width: 1080, height: 1920 },
  { id: "4:3", width: 1600, height: 1200 },
] as const

export const MAX_OUTPUT_DIMENSION = 8192
export const MIN_OUTPUT_DIMENSION = 64

function defaultLabel(text: string, position: LabelPosition): LabelStyle {
  return {
    text,
    fontFamily: "inter",
    fontSize: 48,
    fontWeight: 700,
    color: "#ffffff",
    background: "#000000",
    backgroundOpacity: 0.55,
    stroke: null,
    position,
  }
}

export const DEFAULT_PLACEMENT: Omit<ImagePlacement, "assetId"> = { fit: "cover", focalX: 0.5, focalY: 0.5 }
export const DEFAULT_LOGO: Omit<LogoPlacement, "assetId"> = { widthFraction: 0.15, corner: "bottom-right", margin: 40 }

export function defaultStyling(): Omit<ComparisonProject, "images" | "logo"> {
  return {
    version: 1,
    layout: "side-by-side",
    labels: {
      before: defaultLabel("Before", "top-left"),
      after: defaultLabel("After", "top-left"),
    },
    style: {
      background: "#ffffff",
      transparentBackground: false,
      padding: 0,
      gap: 0,
      divider: { enabled: true, color: "#ffffff", width: 6 },
      cornerRadius: 0,
    },
    output: { width: 1600, height: 1200, format: "png", quality: 0.92 },
  }
}

export function createDefaultProject(): ComparisonProject {
  return {
    ...defaultStyling(),
    images: {
      before: { assetId: null, ...DEFAULT_PLACEMENT },
      after: { assetId: null, ...DEFAULT_PLACEMENT },
    },
    logo: { assetId: null, ...DEFAULT_LOGO },
  }
}
