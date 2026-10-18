import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { useEditor } from "@/twinshot/editor-context"
import {
  ASPECT_PRESETS,
  FONTS,
  MAX_OUTPUT_DIMENSION,
  MIN_OUTPUT_DIMENSION,
  type Corner,
  type LabelPosition,
  type Side,
} from "@/twinshot/types"
import { ColorField, FieldRow, PanelSection, SegmentedField, SliderField } from "./controls"
import { ImageSlot } from "./image-slot"

const pct = (v: number) => `${Math.round(v * 100)}%`
const px = (v: number) => `${v}px`

const LABEL_POSITIONS: LabelPosition[] = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"]
const CORNERS: Corner[] = ["top-left", "top-right", "bottom-left", "bottom-right"]

function PositionGrid<T extends string>({ label, value, options, cols, onChange }: {
  label: string
  value: T
  options: T[]
  cols: 2 | 3
  onChange: (v: T) => void
}) {
  return (
    <FieldRow label={label}>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={1}
        value={value}
        aria-label={label}
        onValueChange={(v) => v && onChange(v as T)}
        className={cn("grid w-full", cols === 3 ? "grid-cols-3" : "grid-cols-2")}
      >
        {options.map((o) => (
          <ToggleGroupItem key={o} value={o} aria-label={o.replace("-", " ")} title={o.replace("-", " ")} className="h-7 w-full">
            <span
              className={cn(
                "flex size-full p-1",
                o.startsWith("top") ? "items-start" : "items-end",
                o.endsWith("left") ? "justify-start" : o.endsWith("right") ? "justify-end" : "justify-center"
              )}
            >
              <span className="h-1.5 w-3 rounded-full bg-current" />
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </FieldRow>
  )
}

function LabelControls({ side }: { side: Side }) {
  const { project, dispatch } = useEditor()
  const l = project.labels[side]
  const update = (patch: Partial<typeof l>) => dispatch({ type: "UPDATE_LABEL", side, patch })
  const id = `label-text-${side}`
  return (
    <div className="flex flex-col gap-5">
      <FieldRow label="Text" htmlFor={id}>
        <Input id={id} value={l.text} maxLength={200} placeholder="Leave empty to hide" onChange={(e) => update({ text: e.target.value })} />
      </FieldRow>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Font">
          <Select value={l.fontFamily} onValueChange={(fontFamily) => update({ fontFamily })}>
            <SelectTrigger size="sm" className="w-full" aria-label="Font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => (
                <SelectItem key={f.id} value={f.id} style={{ fontFamily: f.css }}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Weight">
          <Select value={String(l.fontWeight)} onValueChange={(v) => update({ fontWeight: Number(v) as 400 | 500 | 700 })}>
            <SelectTrigger size="sm" className="w-full" aria-label="Weight">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="400">Regular</SelectItem>
              <SelectItem value="500">Medium</SelectItem>
              <SelectItem value="700">Bold</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
      </div>
      <SliderField label="Size" value={l.fontSize} min={12} max={200} format={px} onChange={(fontSize) => update({ fontSize })} />
      <PositionGrid label="Position" value={l.position} options={LABEL_POSITIONS} cols={3} onChange={(position) => update({ position })} />
      <div className="grid grid-cols-2 gap-3">
        <ColorField label="Text color" value={l.color} onChange={(color) => update({ color })} />
        <ColorField label="Background" value={l.background} onChange={(background) => update({ background })} />
      </div>
      <SliderField
        label="Background opacity"
        value={l.backgroundOpacity}
        min={0}
        max={1}
        step={0.01}
        format={pct}
        onChange={(backgroundOpacity) => update({ backgroundOpacity })}
      />
      <div className="flex items-center justify-between">
        <Label htmlFor={`stroke-${side}`} className="text-xs font-medium text-muted-foreground">
          Text outline
        </Label>
        <Switch
          id={`stroke-${side}`}
          checked={l.stroke !== null}
          onCheckedChange={(on) => update({ stroke: on ? { color: "#000000", width: 3 } : null })}
        />
      </div>
      {l.stroke && (
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Outline color" value={l.stroke.color} onChange={(color) => update({ stroke: { ...l.stroke!, color } })} />
          <SliderField label="Width" value={l.stroke.width} min={1} max={20} format={px} onChange={(width) => update({ stroke: { ...l.stroke!, width } })} />
        </div>
      )}
    </div>
  )
}

function DimensionInput({ label, value, onCommit }: { label: string; value: number; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState(String(value))
  const [synced, setSynced] = useState(value)
  if (synced !== value) {
    setSynced(value)
    setDraft(String(value))
  }
  const n = Number(draft)
  const invalid = !Number.isInteger(n) || n < MIN_OUTPUT_DIMENSION || n > MAX_OUTPUT_DIMENSION
  const commit = () => (invalid ? setDraft(String(value)) : onCommit(n))
  const id = `dim-${label}`
  return (
    <FieldRow label={label} htmlFor={id}>
      <Input
        id={id}
        inputMode="numeric"
        value={draft}
        aria-invalid={invalid}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className="font-mono text-sm tabular-nums"
      />
    </FieldRow>
  )
}

export function RightPanel() {
  const { project, dispatch } = useEditor()
  const { style, logo, output } = project
  const updateStyle = (patch: Partial<typeof style>) => dispatch({ type: "UPDATE_STYLE", patch })
  const activePreset = ASPECT_PRESETS.find((p) => p.width === output.width && p.height === output.height)?.id ?? "custom"

  return (
    <div className="flex flex-col gap-8">
      <PanelSection title="Labels">
        <Tabs defaultValue="before">
          <TabsList className="w-full">
            <TabsTrigger value="before">Before</TabsTrigger>
            <TabsTrigger value="after">After</TabsTrigger>
          </TabsList>
          <TabsContent value="before" className="mt-3">
            <LabelControls side="before" />
          </TabsContent>
          <TabsContent value="after" className="mt-3">
            <LabelControls side="after" />
          </TabsContent>
        </Tabs>
      </PanelSection>

      <Separator />

      <PanelSection title="Divider">
        <div className="flex items-center justify-between">
          <Label htmlFor="divider-on" className="text-xs font-medium text-muted-foreground">
            Show divider line
          </Label>
          <Switch
            id="divider-on"
            checked={style.divider.enabled}
            onCheckedChange={(enabled) => dispatch({ type: "UPDATE_DIVIDER", patch: { enabled } })}
          />
        </div>
        {style.divider.enabled && (
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Color" value={style.divider.color} onChange={(color) => dispatch({ type: "UPDATE_DIVIDER", patch: { color } })} />
            <SliderField label="Width" value={style.divider.width} min={1} max={60} format={px} onChange={(width) => dispatch({ type: "UPDATE_DIVIDER", patch: { width } })} />
          </div>
        )}
      </PanelSection>

      <Separator />

      <PanelSection title="Spacing and frame">
        <ColorField label="Background" value={style.background} onChange={(background) => updateStyle({ background })} disabled={style.transparentBackground && output.format === "png"} />
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="transparent-bg" className="text-xs font-medium text-muted-foreground">
            Transparent background {output.format === "jpeg" && "(PNG only)"}
          </Label>
          <Switch
            id="transparent-bg"
            checked={style.transparentBackground}
            disabled={output.format === "jpeg"}
            onCheckedChange={(transparentBackground) => updateStyle({ transparentBackground })}
          />
        </div>
        <SliderField label="Padding" value={style.padding} min={0} max={300} format={px} onChange={(padding) => updateStyle({ padding })} />
        <SliderField label="Gap" value={style.gap} min={0} max={200} format={px} onChange={(gap) => updateStyle({ gap })} />
        <SliderField label="Corner radius" value={style.cornerRadius} min={0} max={200} format={px} onChange={(cornerRadius) => updateStyle({ cornerRadius })} />
      </PanelSection>

      <Separator />

      <PanelSection title="Logo">
        <ImageSlot slot="logo" title="Logo" hint="Optional. PNG with transparency works best" />
        {logo.assetId && (
          <>
            <SliderField
              label="Size"
              value={logo.widthFraction}
              min={0.03}
              max={0.6}
              step={0.01}
              format={pct}
              onChange={(widthFraction) => dispatch({ type: "UPDATE_LOGO", patch: { widthFraction } })}
            />
            <PositionGrid label="Corner" value={logo.corner} options={CORNERS} cols={2} onChange={(corner) => dispatch({ type: "UPDATE_LOGO", patch: { corner } })} />
            <SliderField label="Margin" value={logo.margin} min={0} max={300} format={px} onChange={(margin) => dispatch({ type: "UPDATE_LOGO", patch: { margin } })} />
          </>
        )}
      </PanelSection>

      <Separator />

      <PanelSection title="Output">
        <FieldRow label="Aspect ratio">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={1}
            value={activePreset}
            aria-label="Aspect ratio"
            onValueChange={(id) => {
              const p = ASPECT_PRESETS.find((x) => x.id === id)
              if (p) dispatch({ type: "SET_OUTPUT", patch: { width: p.width, height: p.height } })
            }}
            className="grid w-full grid-cols-5"
          >
            {ASPECT_PRESETS.map((p) => (
              <ToggleGroupItem key={p.id} value={p.id} className="w-full px-0 font-mono text-xs">
                {p.id}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FieldRow>
        <div className="grid grid-cols-2 gap-3">
          <DimensionInput label="Width" value={output.width} onCommit={(width) => dispatch({ type: "SET_OUTPUT", patch: { width } })} />
          <DimensionInput label="Height" value={output.height} onCommit={(height) => dispatch({ type: "SET_OUTPUT", patch: { height } })} />
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">
          {MIN_OUTPUT_DIMENSION} to {MAX_OUTPUT_DIMENSION}px per side.
        </p>
        <SegmentedField
          label="Format"
          value={output.format}
          onChange={(format) => dispatch({ type: "SET_OUTPUT", patch: { format } })}
          options={[
            { value: "png", label: "PNG" },
            { value: "jpeg", label: "JPEG" },
          ]}
        />
        {output.format === "jpeg" && (
          <SliderField
            label="JPEG quality"
            value={output.quality}
            min={0.5}
            max={1}
            step={0.01}
            format={pct}
            onChange={(quality) => dispatch({ type: "SET_OUTPUT", patch: { quality } })}
          />
        )}
      </PanelSection>
    </div>
  )
}
