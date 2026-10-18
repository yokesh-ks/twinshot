import { useId, useState, type ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

export function FieldRow({ label, htmlFor, value, children, className }: {
  label: string
  htmlFor?: string
  value?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
        {value !== undefined && <span className="font-mono text-xs tabular-nums text-muted-foreground">{value}</span>}
      </div>
      {children}
    </div>
  )
}

export function SliderField({ label, value, min, max, step = 1, onChange, format, disabled }: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
  disabled?: boolean
}) {
  return (
    <FieldRow label={label} value={format ? format(value) : value}>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={([v]) => onChange(v)}
      />
    </FieldRow>
  )
}

const HEX = /^#[0-9a-fA-F]{6}$/

export function ColorField({ label, value, onChange, disabled }: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const id = useId()
  const [draft, setDraft] = useState(value)
  const [synced, setSynced] = useState(value)
  if (synced !== value) {
    setSynced(value)
    setDraft(value)
  }
  return (
    <FieldRow label={label} htmlFor={id}>
      <div className="flex items-center gap-2">
        <label
          className={cn(
            "relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50",
            disabled && "pointer-events-none opacity-50"
          )}
          style={{ backgroundColor: value }}
        >
          <span className="sr-only">{label} picker</span>
          <input
            type="color"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
        <Input
          id={id}
          value={draft}
          onBlur={() => setDraft(value)}
          disabled={disabled}
          maxLength={7}
          spellCheck={false}
          className="font-mono text-xs uppercase"
          onChange={(e) => {
            setDraft(e.target.value)
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`
            if (HEX.test(v)) onChange(v.toLowerCase())
          }}
        />
      </div>
    </FieldRow>
  )
}

export function SegmentedField<T extends string>({ label, value, options, onChange, disabled }: {
  label: string
  value: T
  options: { value: T; label: ReactNode; title?: string }[]
  onChange: (v: T) => void
  disabled?: boolean
}) {
  return (
    <FieldRow label={label}>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={value}
        disabled={disabled}
        aria-label={label}
        onValueChange={(v) => v && onChange(v as T)}
        className="w-full"
      >
        {options.map((o) => (
          <ToggleGroupItem key={o.value} value={o.value} aria-label={o.title} title={o.title} className="flex-1 text-xs">
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </FieldRow>
  )
}

export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}
