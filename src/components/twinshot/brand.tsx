import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <a
      href="#/"
      aria-label="TwinShot editor"
      className={cn("flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", className)}
    >
      <div aria-hidden className="relative size-7">
        <span className="absolute inset-y-0 left-0 w-[15px] rounded-l-md bg-foreground" />
        <span className="absolute inset-y-0 right-0 w-[11px] rounded-r-md border-2 border-l-0 border-foreground" />
      </div>
      <div className="leading-tight">
        <span className="block text-base font-semibold tracking-tight">TwinShot</span>
        <span className="hidden text-xs text-muted-foreground sm:block">Two images. One story.</span>
      </div>
    </a>
  )
}

const footerLink = "font-medium text-foreground underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"

export function Copyright({ className }: { className?: string }) {
  return (
    <footer className={cn("flex flex-col gap-1 text-xs leading-relaxed text-muted-foreground", className)}>
      <p>
        Copyright &copy; 2026 by{" "}
        <a href="https://www.ingeniousclan.com/" target="_blank" rel="noopener noreferrer" className={footerLink}>
          Ingenious Clan
        </a>
        .
      </p>
      <p>
        Made with <span aria-label="love" className="text-destructive">&hearts;</span> by{" "}
        <a href="https://www.yokesh.in/" target="_blank" rel="noopener noreferrer" className={footerLink}>
          Yokesh
        </a>
      </p>
    </footer>
  )
}
