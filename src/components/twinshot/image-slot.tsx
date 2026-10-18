import { useEffect, useRef, useState, type DragEvent } from "react"
import { ImagePlus, RefreshCw, Trash2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ACCEPT_ATTR } from "@/twinshot/assets"
import { useEditor, type Slot } from "@/twinshot/editor-context"

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong loading this image."
}

export function useSlotUpload(slot: Slot) {
  const { attach } = useEditor()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const upload = async (file: Blob | null | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      await attach(slot, file)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }
  return { upload, error, busy }
}

function useThumbnail(blob: Blob | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}

export function ImageSlot({ slot, title, hint }: { slot: Slot; title: string; hint?: string }) {
  const { project, assets, remove } = useEditor()
  const { upload, error, busy } = useSlotUpload(slot)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const assetId = slot === "logo" ? project.logo.assetId : project.images[slot].assetId
  const asset = assetId ? assets[assetId] : undefined
  const thumb = useThumbnail(asset?.original)

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    upload(e.dataTransfer.files[0])
  }

  const browse = () => inputRef.current?.click()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        {asset && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="size-7" onClick={browse} aria-label={`Replace ${title.toLowerCase()}`} title="Replace">
              <RefreshCw />
            </Button>
            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" onClick={() => remove(slot)} aria-label={`Remove ${title.toLowerCase()}`} title="Remove">
              <Trash2 />
            </Button>
          </div>
        )}
      </div>
      <button
        type="button"
        data-slot-zone={slot}
        onClick={browse}
        onPaste={(e) => {
          const file = Array.from(e.clipboardData.files)[0]
          if (!file) return
          e.preventDefault()
          upload(file)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        aria-label={asset ? `${title}: ${asset.name}. Click, drop, or paste to replace` : `Upload ${title.toLowerCase()}. Click, drop, or paste an image`}
        className={cn(
          "group relative flex w-full items-center gap-3 overflow-hidden rounded-lg border text-left transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
          asset ? "bg-card p-2 hover:bg-accent" : "h-20 justify-center border-dashed bg-muted/40 hover:border-ring hover:bg-muted",
          dragging && "border-primary bg-accent",
          error && "border-destructive"
        )}
      >
        {asset && thumb ? (
          <>
            <img src={thumb} alt="" className={cn("size-14 shrink-0 rounded-md bg-muted object-cover", slot === "logo" && "object-contain checkerboard")} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{asset.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {asset.width} x {asset.height}
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImagePlus className="size-5" />
            <span className="text-xs">{busy ? "Loading..." : (hint ?? "Drop, paste, or click to upload")}</span>
          </div>
        )}
      </button>
      {error && (
        <p role="alert" className="flex items-start gap-1.5 text-xs text-destructive">
          <TriangleAlert className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          upload(e.target.files?.[0])
          e.target.value = ""
        }}
      />
    </div>
  )
}
