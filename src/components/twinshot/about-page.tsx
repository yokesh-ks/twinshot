import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Crop,
  Download,
  FileJson,
  Image as ImageIcon,
  LayoutPanelLeft,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Upload,
  type LucideIcon,
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { BrandMark, Copyright } from "@/components/twinshot/brand"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Upload, title: "Add two images", body: "Drop, paste or pick a before and an after shot. JPG, PNG, WebP and more." },
  { icon: SlidersHorizontal, title: "Make it yours", body: "Choose a layout, style the labels, tune the divider, spacing and logo." },
  { icon: Download, title: "Export", body: "Download a crisp PNG or JPEG at the exact size your platform expects." },
]

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: LayoutPanelLeft, title: "Side by side or stacked", body: "Horizontal and vertical layouts with an adjustable split." },
  { icon: Crop, title: "Smart framing", body: "Fill or fit each image, with focal point controls to keep the subject in view." },
  { icon: Tag, title: "Styled labels", body: "Custom text, fonts, colors, outlines and backgrounds for each side." },
  { icon: ImageIcon, title: "Your branding", body: "Place a logo in any corner with size, opacity and margin controls." },
  { icon: Sparkles, title: "Social-ready sizes", body: "Square, portrait, story and widescreen presets, or any custom size." },
  { icon: FileJson, title: "Reusable projects", body: "Save your settings as a file and reuse the same look on new photos." },
]

const ROADMAP = ["Interactive slider embeds", "Batch processing", "Animated GIF and video export", "Annotations and arrows"]

function HeroVisual() {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-muted shadow-sm">
      <img
        src="/about-hero.webp"
        alt="A room shown before and after renovation, split down the middle"
        className="aspect-video w-full object-cover"
      />
      <Badge variant="secondary" className="absolute top-3 left-3 shadow-sm">Before</Badge>
      <Badge className="absolute top-3 right-3 shadow-sm">After</Badge>
    </div>
  )
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="flex max-w-2xl flex-col gap-2">
      <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{eyebrow}</span>
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>
      {description && <p className="leading-7 text-muted-foreground">{description}</p>}
    </div>
  )
}

export function AboutPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur">
        <BrandMark />
        <div className="flex items-center gap-1.5">
          <ModeToggle />
          <Button size="sm" asChild className="ml-1">
            <a href="#/">
              <ArrowLeft />
              Back to editor
            </a>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-20 px-5 py-12 sm:py-16">
        <section className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col items-start gap-5">
            <Badge variant="outline">Free and open source</Badge>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Two images. <span className="text-muted-foreground">One story.</span>
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              TwinShot is a simple editor for making polished before and after comparison images. Upload two photos,
              style them, and export a ready-to-share image in seconds, all without leaving your browser.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href="#/">
                  Start creating
                  <ArrowRight />
                </a>
              </Button>
            </div>
          </div>
          <HeroVisual />
        </section>

        <section className="flex flex-col gap-8">
          <SectionHeading eyebrow="How it works" title="From two photos to one image in three steps" />
          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <Card className="h-full gap-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <step.icon className="size-4" />
                      </span>
                      <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1.5">
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription className="leading-6">{step.body}</CardDescription>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Features"
            title="Everything a comparison needs, nothing it doesn't"
            description="Built for designers, marketers, photographers, renovators and anyone who wants to show a transformation clearly."
          />
          <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/60">
                  <f.icon className="size-4" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="gap-3">
              <ShieldCheck className="size-6" />
              <CardTitle className="text-xl">Private by design</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm leading-6 text-primary-foreground/80">
              <p>
                TwinShot runs entirely in your browser. Your images are never uploaded, stored or seen by anyone else.
              </p>
              <p>There are no accounts, no tracking and no servers involved in editing or exporting.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="gap-3">
              <Code2 className="size-6" />
              <CardTitle className="text-xl">Open source</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
              <p>
                TwinShot is released under the MIT license. Anyone can use it, study how it works, suggest improvements
                or build on top of it.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">MIT license</Badge>
                <Badge variant="secondary">Works offline once loaded</Badge>
                <Badge variant="secondary">No sign-up</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeading
            eyebrow="What's next"
            title="On the roadmap"
            description="Ideas we're exploring for future versions."
          />
          <div className="flex flex-wrap gap-2">
            {ROADMAP.map((item) => (
              <Badge key={item} variant="outline" className="px-3 py-1 text-sm font-normal">
                {item}
              </Badge>
            ))}
          </div>
        </section>
      </main>

      <Separator />
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-5 py-8 sm:flex-row sm:items-center">
        <BrandMark />
        <Copyright className="sm:items-end sm:text-right" />
      </div>
    </div>
  )
}
