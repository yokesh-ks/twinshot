import { useEffect } from "react"
import { ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Header } from "@/components/twinshot/header"
import { LeftPanel } from "@/components/twinshot/left-panel"
import { Preview } from "@/components/twinshot/preview"
import { RightPanel } from "@/components/twinshot/right-panel"
import { EditorProvider, useEditor } from "@/twinshot/editor-context"

function GlobalPaste() {
  const { project, attach } = useEditor()
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (e.defaultPrevented) return
      const target = e.target as HTMLElement | null
      if (target?.closest("input, textarea, [contenteditable]")) return
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"))
      if (!file) return
      const side = !project.images.before.assetId ? "before" : !project.images.after.assetId ? "after" : null
      if (!side) {
        toast("Both slots are filled", { description: "Focus an image slot and paste to replace it." })
        return
      }
      attach(side, file).catch((err) => toast.error(err instanceof Error ? err.message : "Couldn't paste image"))
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [project.images.before.assetId, project.images.after.assetId, attach])
  return null
}

function PrivacyNote() {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
      <ShieldCheck className="mt-px size-4 shrink-0 text-foreground" />
      Everything happens in your browser. Your photos are never uploaded.
    </p>
  )
}

function Editor() {
  return (
    <div className="flex min-h-svh flex-col bg-background min-[900px]:h-svh">
      <Header />
      <GlobalPaste />
      <main className="flex flex-1 flex-col min-[900px]:grid min-[900px]:min-h-0 min-[900px]:grid-cols-[300px_1fr_340px]">
        <section
          aria-label="Preview"
          className="sticky top-0 z-10 order-first h-[45svh] border-b bg-muted/40 p-3 backdrop-blur canvas-stage min-[900px]:static min-[900px]:order-none min-[900px]:col-start-2 min-[900px]:row-start-1 min-[900px]:h-auto min-[900px]:border-b-0 min-[900px]:p-6"
        >
          <Preview />
        </section>
        <aside aria-label="Images and layout" className="min-h-0 border-b min-[900px]:col-start-1 min-[900px]:row-start-1 min-[900px]:border-r min-[900px]:border-b-0">
          <ScrollArea className="min-[900px]:h-full">
            <div className="flex flex-col gap-8 p-5">
              <LeftPanel />
              <PrivacyNote />
            </div>
          </ScrollArea>
        </aside>
        <aside aria-label="Style and output" className="min-h-0 min-[900px]:col-start-3 min-[900px]:row-start-1 min-[900px]:border-l">
          <ScrollArea className="min-[900px]:h-full">
            <div className="p-5">
              <RightPanel />
            </div>
          </ScrollArea>
        </aside>
      </main>
    </div>
  )
}

export function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <EditorProvider>
        <Editor />
        <Toaster position="bottom-center" />
      </EditorProvider>
    </TooltipProvider>
  )
}

export default App
