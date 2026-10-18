import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react"
import { EyeOff, ImagePlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import { ACCEPT_ATTR } from "@/twinshot/assets"
import { useEditor } from "@/twinshot/editor-context"
import { computeLayout } from "@/twinshot/layout"
import { renderComparison } from "@/twinshot/render"
import type { Side } from "@/twinshot/types"
import { useSlotUpload } from "./image-slot"

function useContainerSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: Math.floor(width), h: Math.floor(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

export function Preview() {
  const { project, assetMap, fontsReady } = useEditor()
  const [containerRef, box] = useContainerSize<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hideOverlays, setHideOverlays] = useState(false)

  const ratio = project.output.width / project.output.height
  let cssW = box.w
  let cssH = cssW / ratio
  if (cssH > box.h) {
    cssH = box.h
    cssW = cssH * ratio
  }
  cssW = Math.max(0, Math.floor(cssW))
  cssH = Math.max(0, Math.floor(cssH))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || cssW === 0 || cssH === 0) return
    const frame = requestAnimationFrame(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      const w = Math.round(cssW * dpr)
      const h = Math.round(cssH * dpr)
      if (canvas.width !== w) canvas.width = w
      if (canvas.height !== h) canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      renderComparison(ctx, project, assetMap, w, h, {
        hideOverlays,
        placeholderColor: "rgba(127,127,127,0.14)",
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [project, assetMap, cssW, cssH, hideOverlays, fontsReady])

  const geo = cssW > 0 ? computeLayout(project, cssW, cssH, cssW / project.output.width) : null
  const transparent = project.style.transparentBackground && project.output.format === "png"

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono tabular-nums">
            {project.output.width} x {project.output.height}
          </Badge>
          <Badge variant="outline" className="uppercase">
            {project.output.format}
          </Badge>
        </div>
        <Toggle
          size="sm"
          pressed={hideOverlays}
          onPressedChange={setHideOverlays}
          aria-label="Hide labels and logo"
          className="text-xs"
        >
          <EyeOff />
          Compare
        </Toggle>
      </div>
      <div ref={containerRef} className="relative flex min-h-0 flex-1 items-center justify-center">
        <div className="relative shadow-xl ring-1 ring-border" style={{ width: cssW, height: cssH }}>
          <canvas
            ref={canvasRef}
            data-testid="preview-canvas"
            aria-label="Comparison preview"
            role="img"
            className={cn("block size-full", transparent && "checkerboard")}
          />
          {geo &&
            (["before", "after"] as Side[]).map(
              (side) =>
                !project.images[side].assetId && (
                  <EmptyRegion
                    key={side}
                    side={side}
                    style={{
                      left: geo.regions[side].x,
                      top: geo.regions[side].y,
                      width: geo.regions[side].w,
                      height: geo.regions[side].h,
                    }}
                  />
                )
            )}
        </div>
      </div>
    </div>
  )
}

function EmptyRegion({ side, style }: { side: Side; style: CSSProperties }) {
  const { upload, error, busy } = useSlotUpload(side)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const name = side === "before" ? "Before" : "After"
  return (
    <button
      type="button"
      style={style}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        upload(e.dataTransfer.files[0])
      }}
      className={cn(
        "absolute flex flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground transition-colors outline-none hover:bg-foreground/5 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
        dragging && "bg-foreground/10"
      )}
      aria-label={`Add ${name.toLowerCase()} image`}
    >
      <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 bg-background/70">
        <ImagePlus className="size-4" />
      </span>
      <span className="text-sm font-medium text-foreground">{busy ? "Loading..." : `Add ${name} image`}</span>
      <span className="hidden text-xs sm:block">Drop, paste, or click</span>
      {error && <span className="text-xs text-destructive">{error}</span>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          upload(e.target.files?.[0])
          e.target.value = ""
        }}
      />
    </button>
  )
}
