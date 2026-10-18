import { z } from "zod"
import { FONTS, MAX_OUTPUT_DIMENSION, MIN_OUTPUT_DIMENSION, type ComparisonProject } from "./types"

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/)
const unit = z.number().min(0).max(1)
const px = z.number().min(0).max(4000)
const fontIds = FONTS.map((f) => f.id) as [string, ...string[]]
const labelPos = z.enum(["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"])
const corner = z.enum(["top-left", "top-right", "bottom-left", "bottom-right"])

const placement = z.object({
  assetId: z.string().nullable(),
  fit: z.enum(["cover", "contain"]),
  focalX: unit,
  focalY: unit,
})

const label = z.object({
  text: z.string().max(200),
  fontFamily: z.enum(fontIds),
  fontSize: z.number().min(4).max(1000),
  fontWeight: z.union([z.literal(400), z.literal(500), z.literal(700)]),
  color: hex,
  background: hex,
  backgroundOpacity: unit,
  stroke: z.object({ color: hex, width: px }).nullable(),
  position: labelPos,
})

const dim = z.number().int().min(MIN_OUTPUT_DIMENSION).max(MAX_OUTPUT_DIMENSION)

const projectSchema = z.object({
  version: z.literal(1),
  layout: z.enum(["side-by-side", "stacked"]),
  images: z.object({ before: placement, after: placement }),
  labels: z.object({ before: label, after: label }),
  style: z.object({
    background: hex,
    transparentBackground: z.boolean().default(false),
    padding: px,
    gap: px,
    divider: z.object({ enabled: z.boolean(), color: hex, width: px }),
    cornerRadius: px,
  }),
  logo: z.object({
    assetId: z.string().nullable(),
    widthFraction: unit,
    corner,
    margin: px,
  }),
  output: z.object({
    width: dim,
    height: dim,
    format: z.enum(["png", "jpeg"]),
    quality: z.number().min(0.5).max(1),
  }),
})

export function parseProject(raw: unknown): ComparisonProject {
  if (typeof raw !== "object" || raw === null) throw new Error("This file is not a TwinShot project.")
  const version = (raw as { version?: unknown }).version
  if (version !== 1) {
    throw new Error(
      version === undefined
        ? "This file is not a TwinShot project."
        : `Unsupported project version (${String(version)}). This app supports version 1.`
    )
  }
  const result = projectSchema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new Error(`Invalid project file: ${issue.path.join(".") || "root"} ${issue.message.toLowerCase()}`)
  }
  return result.data as ComparisonProject
}

export function serializeProject(project: ComparisonProject): string {
  return JSON.stringify(project, null, 2)
}

const STORAGE_KEY = "twinshot:project"

export function saveToStorage(project: ComparisonProject): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
  } catch {
    // storage full or disabled; autosave is best-effort
  }
}

export function loadFromStorage(): ComparisonProject | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return detachAssets(parseProject(JSON.parse(raw)), new Set())
  } catch {
    return null
  }
}

export function detachAssets(project: ComparisonProject, known: Set<string>): ComparisonProject {
  const keep = (id: string | null) => (id && known.has(id) ? id : null)
  return {
    ...project,
    images: {
      before: { ...project.images.before, assetId: keep(project.images.before.assetId) },
      after: { ...project.images.after, assetId: keep(project.images.after.assetId) },
    },
    logo: { ...project.logo, assetId: keep(project.logo.assetId) },
  }
}
