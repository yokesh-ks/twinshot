import { ArrowLeftRight, Columns2, Rows2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEditor } from "@/twinshot/editor-context"
import type { Side } from "@/twinshot/types"
import { PanelSection, SegmentedField, SliderField } from "./controls"
import { ImageSlot } from "./image-slot"

const pct = (v: number) => `${Math.round(v * 100)}%`

export function LeftPanel() {
  const { project, dispatch } = useEditor()
  const canSwap = project.images.before.assetId !== null || project.images.after.assetId !== null

  return (
    <div className="flex flex-col gap-8">
      <PanelSection title="Images">
        <ImageSlot slot="before" title="Before" />
        <Button
          variant="outline"
          size="sm"
          disabled={!canSwap}
          onClick={() => dispatch({ type: "SWAP_IMAGES" })}
          className="self-center"
        >
          <ArrowLeftRight />
          Swap before and after
        </Button>
        <ImageSlot slot="after" title="After" />
      </PanelSection>

      <PanelSection title="Layout">
        <SegmentedField
          label="Arrangement"
          value={project.layout}
          onChange={(layout) => dispatch({ type: "SET_LAYOUT", layout })}
          options={[
            { value: "side-by-side", label: <><Columns2 /> Side by side</>, title: "Side by side" },
            { value: "stacked", label: <><Rows2 /> Stacked</>, title: "Stacked" },
          ]}
        />
      </PanelSection>

      <PanelSection title="Positioning">
        <Tabs defaultValue="before">
          <TabsList className="w-full">
            <TabsTrigger value="before">Before</TabsTrigger>
            <TabsTrigger value="after">After</TabsTrigger>
          </TabsList>
          {(["before", "after"] as Side[]).map((side) => {
            const p = project.images[side]
            const contain = p.fit === "contain"
            return (
              <TabsContent key={side} value={side} className="mt-3 flex flex-col gap-5">
                <SegmentedField
                  label="Fit"
                  value={p.fit}
                  onChange={(fit) => dispatch({ type: "SET_PLACEMENT", side, patch: { fit } })}
                  options={[
                    { value: "cover", label: "Fill (crop)", title: "Cover: fill the area, cropping edges" },
                    { value: "contain", label: "Fit (whole)", title: "Contain: show the whole image" },
                  ]}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-5" tabIndex={contain ? 0 : -1}>
                      <SliderField
                        label="Focus horizontal"
                        value={p.focalX}
                        min={0}
                        max={1}
                        step={0.01}
                        format={pct}
                        disabled={contain}
                        onChange={(focalX) => dispatch({ type: "SET_PLACEMENT", side, patch: { focalX } })}
                      />
                      <SliderField
                        label="Focus vertical"
                        value={p.focalY}
                        min={0}
                        max={1}
                        step={0.01}
                        format={pct}
                        disabled={contain}
                        onChange={(focalY) => dispatch({ type: "SET_PLACEMENT", side, patch: { focalY } })}
                      />
                    </div>
                  </TooltipTrigger>
                  {contain && (
                    <TooltipContent side="right">Focus only applies in Fill mode, when the image is cropped.</TooltipContent>
                  )}
                </Tooltip>
              </TabsContent>
            )
          })}
        </Tabs>
      </PanelSection>
    </div>
  )
}
