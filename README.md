# Color Background Remover

A browser-based tool to remove solid-color backgrounds from images by clicking on a color. All processing happens client-side — no uploads to any server.

## Features

- Upload JPG, JPEG, PNG, WebP images (up to 20 MB)
- Click any pixel to select its color (HEX + RGB display)
- Remove matching pixels with adjustable tolerance (0–100)
- Live preview of the result
- Reset to original image
- Download result as PNG with transparency preserved

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 3
- HTML Canvas API

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build

```bash
npm run build
```

Output is in `dist/`, ready for deployment (Vercel, Netlify, etc.).

## How It Works

1. Upload an image — it renders to a hidden full-resolution canvas and a visible preview canvas.
2. Click a pixel — the RGB and HEX values are read from the canvas `ImageData`.
3. Adjust tolerance — controls how similar a pixel must be to match.
4. Click "Remove Color" — every pixel within tolerance of the selected color gets alpha=0.
5. Download — the canvas exports as a transparent PNG.
