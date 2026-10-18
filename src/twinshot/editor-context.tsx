import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react"
import { disposeAsset, loadAsset, type Asset } from "./assets"
import { detachAssets, loadFromStorage, saveToStorage } from "./project-io"
import { projectReducer, type Action } from "./reducer"
import { createDefaultProject, FONTS, type AssetMap, type ComparisonProject, type Side } from "./types"

export type Slot = Side | "logo"

interface EditorValue {
  project: ComparisonProject
  dispatch: (action: Action) => void
  assets: Record<string, Asset>
  assetMap: AssetMap
  attach: (slot: Slot, file: Blob) => Promise<void>
  remove: (slot: Slot) => void
  importProject: (project: ComparisonProject) => Slot[]
  fontsReady: boolean
}

const EditorContext = createContext<EditorValue | null>(null)

function slotAssetId(project: ComparisonProject, slot: Slot): string | null {
  return slot === "logo" ? project.logo.assetId : project.images[slot].assetId
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const [project, dispatch] = useReducer(projectReducer, undefined, () => loadFromStorage() ?? createDefaultProject())
  const [assets, setAssets] = useState<Record<string, Asset>>({})
  const [fontsReady, setFontsReady] = useState(false)
  const assetsRef = useRef(assets)
  assetsRef.current = assets

  useEffect(() => {
    const loads = FONTS.flatMap((f) => f.weights.map((w) => document.fonts.load(`${w} 32px "${f.css}"`)))
    Promise.allSettled(loads).then(() => setFontsReady(true))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => saveToStorage(project), 300)
    return () => clearTimeout(t)
  }, [project])

  useEffect(() => {
    const referenced = new Set([project.images.before.assetId, project.images.after.assetId, project.logo.assetId])
    const stale = Object.values(assets).filter((a) => !referenced.has(a.id))
    if (stale.length === 0) return
    stale.forEach(disposeAsset)
    setAssets((prev) => {
      const next = { ...prev }
      stale.forEach((a) => delete next[a.id])
      return next
    })
  }, [project, assets])

  useEffect(() => () => Object.values(assetsRef.current).forEach(disposeAsset), [])

  const attach = useCallback(async (slot: Slot, file: Blob) => {
    const asset = await loadAsset(file)
    setAssets((prev) => ({ ...prev, [asset.id]: asset }))
    if (slot === "logo") dispatch({ type: "SET_LOGO", assetId: asset.id })
    else dispatch({ type: "SET_IMAGE", side: slot, assetId: asset.id })
  }, [])

  const remove = useCallback((slot: Slot) => {
    if (slot === "logo") dispatch({ type: "SET_LOGO", assetId: null })
    else dispatch({ type: "SET_IMAGE", side: slot, assetId: null })
  }, [])

  const importProject = useCallback(
    (incoming: ComparisonProject) => {
      const known = new Set(Object.keys(assetsRef.current))
      const detached = detachAssets(incoming, known)
      const slots: Slot[] = ["before", "after", "logo"]
      const merged: ComparisonProject = {
        ...detached,
        images: {
          before: { ...detached.images.before, assetId: detached.images.before.assetId ?? project.images.before.assetId },
          after: { ...detached.images.after, assetId: detached.images.after.assetId ?? project.images.after.assetId },
        },
        logo: { ...detached.logo, assetId: detached.logo.assetId ?? project.logo.assetId },
      }
      dispatch({ type: "LOAD_PROJECT", project: merged })
      return slots.filter((s) => slotAssetId(incoming, s) !== null && slotAssetId(merged, s) === null)
    },
    [project]
  )

  const assetMap = useMemo(() => {
    const map: AssetMap = {}
    for (const a of Object.values(assets)) map[a.id] = a.bitmap
    return map
  }, [assets])

  const value = useMemo(
    () => ({ project, dispatch, assets, assetMap, attach, remove, importProject, fontsReady }),
    [project, assets, assetMap, attach, remove, importProject, fontsReady]
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEditor(): EditorValue {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error("useEditor must be used inside EditorProvider")
  return ctx
}
