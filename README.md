# TwinShot

*Two images. One story.*

TwinShot is an open-source, privacy-first, browser-based editor for creating static before-and-after comparison images.

## Privacy

TwinShot processes all images locally in your browser. Your photos are never uploaded to a server. There are no accounts and no tracking of image content. Exported projects (JSON) contain only your styling settings, not your images.

## Features

- Upload, drag-and-drop, or paste two images (JPG, PNG, WebP), with EXIF orientation handled
- Side-by-side or stacked layouts, cover/contain fit, and focal-point cropping
- Labels with bundled fonts (Inter, Lora, JetBrains Mono), weight, size, colors, background opacity, outline, and six positions
- Divider, padding, gap, corner radius, background color or transparent PNG
- Optional corner logo
- Aspect-ratio presets and custom output size, PNG or JPEG export at full resolution
- Save/open settings as JSON, autosave to local storage, reset styles while keeping images

## Development

```bash
npm install
npm run dev
npm run build
```

The rendering engine lives in `src/twinshot/` and has no React dependency. The same `renderComparison()` function draws the live preview and the exported file.

## Contributing

Issues and pull requests are welcome. Keep the renderer framework-independent and keep every editor control mapped to a field in `ComparisonProject`.

## License

MIT
