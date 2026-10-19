import { useRef, useState } from "react"
import { ChevronDown, Download, FileJson, FolderOpen, Info, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ModeToggle } from "@/components/mode-toggle"
import { BrandMark } from "@/components/twinshot/brand"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEditor } from "@/twinshot/editor-context"
import { downloadBlob, exportFilename, renderToBlob } from "@/twinshot/export"
import { parseProject, serializeProject } from "@/twinshot/project-io"

export function Header() {
  const { project, dispatch, assetMap, importProject } = useEditor()
  const [exporting, setExporting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const ready = project.images.before.assetId !== null && project.images.after.assetId !== null

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await renderToBlob(project, assetMap)
      const name = exportFilename(project)
      downloadBlob(blob, name)
      toast.success(`Downloaded ${name}`)
    } catch (err) {
      toast.error("Export failed", { description: err instanceof Error ? err.message : "Please try a smaller output size." })
    } finally {
      setExporting(false)
    }
  }

  const saveProject = () => {
    downloadBlob(new Blob([serializeProject(project)], { type: "application/json" }), "twinshot-project.json")
    toast.success("Project settings saved", { description: "Images are not included in the file." })
  }

  const openProject = async (file: File | undefined) => {
    if (!file) return
    try {
      const parsed = parseProject(JSON.parse(await file.text()))
      const missing = importProject(parsed)
      toast.success("Project settings loaded", {
        description: missing.length ? `Please re-attach: ${missing.join(", ")} image.` : undefined,
      })
    } catch (err) {
      toast.error("Couldn't open project", {
        description: err instanceof SyntaxError ? "The file isn't valid JSON." : err instanceof Error ? err.message : undefined,
      })
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <BrandMark />
      <div className="flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <FileJson />
              <span className="hidden sm:inline">Project</span>
              <ChevronDown className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={saveProject}>
              <Download />
              Save settings (.json)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
              <FolderOpen />
              Open settings...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            openProject(e.target.files?.[0])
            e.target.value = ""
          }}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <RotateCcw />
              <span className="hidden sm:inline">Reset</span>
              <ChevronDown className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                dispatch({ type: "RESET_STYLES" })
                toast("Styles reset", { description: "Your images were kept." })
              }}
            >
              <RotateCcw />
              Reset styles (keep images)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
              <Trash2 />
              Start over...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" asChild>
          <a href="#/about">
            <Info />
            <span className="hidden sm:inline">About</span>
          </a>
        </Button>

        <ModeToggle />

        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={ready ? -1 : 0}>
              <Button size="sm" onClick={handleExport} disabled={!ready || exporting} className="ml-1">
                {exporting ? <Spinner /> : <Download />}
                Export {project.output.format === "jpeg" ? "JPEG" : "PNG"}
              </Button>
            </span>
          </TooltipTrigger>
          {!ready && <TooltipContent>Add both images to export</TooltipContent>}
        </Tooltip>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start over?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes both images, the logo, and resets every setting to its default.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => dispatch({ type: "RESET_ALL" })}
            >
              Start over
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
