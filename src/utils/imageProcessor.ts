import type { RGBColor, SelectionResult, CropRect } from '../types/image'
import { safeGetContext } from './helpers'

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image.'))
    }

    img.src = url
  })
}

export function renderFullResolution(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement
): ImageData {
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = safeGetContext(canvas)
  if (!ctx) return new ImageData(1, 1)
  ctx.drawImage(img, 0, 0)
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

export function renderToDisplay(
  displayCanvas: HTMLCanvasElement,
  sourceCanvas: HTMLCanvasElement,
  maxWidth: number,
  maxHeight: number
): void {
  const ctx = safeGetContext(displayCanvas)
  if (!ctx) return
  const scale = Math.min(
    maxWidth / sourceCanvas.width,
    maxHeight / sourceCanvas.height,
    1
  )
  const displayWidth = Math.round(sourceCanvas.width * scale)
  const displayHeight = Math.round(sourceCanvas.height * scale)

  displayCanvas.width = displayWidth
  displayCanvas.height = displayHeight
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(sourceCanvas, 0, 0, displayWidth, displayHeight)
}

export function removeColor(
  imageData: ImageData,
  targetColor: RGBColor,
  tolerance: number,
  strength: number = 100
): ImageData {
  const data = new Uint8ClampedArray(imageData.data)
  const factor = Math.max(0, Math.min(100, strength)) / 100

  if (factor >= 1) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      if (
        Math.abs(r - targetColor.r) <= tolerance &&
        Math.abs(g - targetColor.g) <= tolerance &&
        Math.abs(b - targetColor.b) <= tolerance
      ) {
        data[i + 3] = 0
      }
    }
  } else if (factor > 0) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      if (
        Math.abs(r - targetColor.r) <= tolerance &&
        Math.abs(g - targetColor.g) <= tolerance &&
        Math.abs(b - targetColor.b) <= tolerance
      ) {
        data[i + 3] = Math.round(data[i + 3] * (1 - factor))
      }
    }
  }

  return new ImageData(data, imageData.width, imageData.height)
}

function removeColorContiguous(
  imageData: ImageData,
  startX: number,
  startY: number,
  tolerance: number
): ImageData | null {
  const { data, width, height } = imageData
  const idx = (startY * width + startX) * 4

  if (data[idx + 3] === 0) return null

  const targetR = data[idx]
  const targetG = data[idx + 1]
  const targetB = data[idx + 2]

  const result = new Uint8ClampedArray(data)
  const visited = new Uint8Array(width * height)

  const queue: number[] = [startY * width + startX]
  let head = 0
  visited[startY * width + startX] = 1

  while (head < queue.length) {
    const pixelIdx = queue[head++]
    const px = pixelIdx % width
    const py = (pixelIdx - px) / width
    const dataIdx = pixelIdx * 4

    if (
      Math.abs(result[dataIdx] - targetR) <= tolerance &&
      Math.abs(result[dataIdx + 1] - targetG) <= tolerance &&
      Math.abs(result[dataIdx + 2] - targetB) <= tolerance
    ) {
      result[dataIdx + 3] = 0

      if (px > 0) {
        const n = pixelIdx - 1
        if (!visited[n]) { visited[n] = 1; queue.push(n) }
      }
      if (px < width - 1) {
        const n = pixelIdx + 1
        if (!visited[n]) { visited[n] = 1; queue.push(n) }
      }
      if (py > 0) {
        const n = pixelIdx - width
        if (!visited[n]) { visited[n] = 1; queue.push(n) }
      }
      if (py < height - 1) {
        const n = pixelIdx + width
        if (!visited[n]) { visited[n] = 1; queue.push(n) }
      }
    }
  }

  return new ImageData(result, width, height)
}

export function computeSelection(
  imageData: ImageData,
  startX: number,
  startY: number,
  tolerance: number
): SelectionResult | null {
  const { data, width, height } = imageData
  const idx = (startY * width + startX) * 4

  if (data[idx + 3] === 0) return null

  const targetR = data[idx]
  const targetG = data[idx + 1]
  const targetB = data[idx + 2]

  const mask = new Uint8Array(width * height)
  const queue: number[] = [startY * width + startX]
  let head = 0
  mask[startY * width + startX] = 1

  while (head < queue.length) {
    const pixelIdx = queue[head++]
    const px = pixelIdx % width
    const py = (pixelIdx - px) / width
    const dataIdx = pixelIdx * 4

    if (
      Math.abs(data[dataIdx] - targetR) <= tolerance &&
      Math.abs(data[dataIdx + 1] - targetG) <= tolerance &&
      Math.abs(data[dataIdx + 2] - targetB) <= tolerance
    ) {
      if (px > 0) {
        const n = pixelIdx - 1
        if (!mask[n]) { mask[n] = 1; queue.push(n) }
      }
      if (px < width - 1) {
        const n = pixelIdx + 1
        if (!mask[n]) { mask[n] = 1; queue.push(n) }
      }
      if (py > 0) {
        const n = pixelIdx - width
        if (!mask[n]) { mask[n] = 1; queue.push(n) }
      }
      if (py < height - 1) {
        const n = pixelIdx + width
        if (!mask[n]) { mask[n] = 1; queue.push(n) }
      }
    }
  }

  const contour: [number, number][] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] !== 1) continue
      if (
        x === 0 || mask[y * width + (x - 1)] !== 1 ||
        x === width - 1 || mask[y * width + (x + 1)] !== 1 ||
        y === 0 || mask[(y - 1) * width + x] !== 1 ||
        y === height - 1 || mask[(y + 1) * width + x] !== 1
      ) {
        contour.push([x, y])
      }
    }
  }

  return { mask, contour }
}

export function pointInPolygon(
  x: number,
  y: number,
  polygon: [number, number][]
): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1]
    const xj = polygon[j][0], yj = polygon[j][1]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

export function createPolygonMask(
  width: number,
  height: number,
  polygon: [number, number][]
): Uint8Array {
  return createMask(width, height, polygon)
}

export function createMask(
  width: number,
  height: number,
  points: [number, number][]
): Uint8Array {
  if (points.length < 3) return new Uint8Array(width * height)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = safeGetContext(canvas)
  if (!ctx) return new Uint8Array(width * height)
  const path = new Path2D()
  path.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) {
    path.lineTo(points[i][0], points[i][1])
  }
  path.closePath()

  const mask = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (ctx.isPointInPath(path, x + 0.5, y + 0.5, 'evenodd')) {
        mask[y * width + x] = 1
      }
    }
  }
  return mask
}

export function removeColorInMask(
  imageData: ImageData,
  targetColor: RGBColor,
  tolerance: number,
  strength: number,
  mask: Uint8Array
): ImageData {
  const data = new Uint8ClampedArray(imageData.data)
  const factor = Math.max(0, Math.min(100, strength)) / 100
  const { width, height } = imageData

  for (let i = 0; i < mask.length; i++) {
    if (mask[i] !== 1) continue
    const idx = i * 4
    const r = data[idx], g = data[idx + 1], b = data[idx + 2]
    if (
      Math.abs(r - targetColor.r) <= tolerance &&
      Math.abs(g - targetColor.g) <= tolerance &&
      Math.abs(b - targetColor.b) <= tolerance
    ) {
      data[idx + 3] = factor >= 1 ? 0 : Math.round(data[idx + 3] * (1 - factor))
    }
  }

  return new ImageData(data, width, height)
}

export function createFreehandMask(
  width: number,
  height: number,
  points: [number, number][]
): Uint8Array {
  return createMask(width, height, points)
}

export function applySelection(
  imageData: ImageData,
  mask: Uint8Array
): ImageData {
  const result = new Uint8ClampedArray(imageData.data)
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === 1) {
      result[i * 4 + 3] = 0
    }
  }
  return new ImageData(result, imageData.width, imageData.height)
}

export function putImageDataOnCanvas(
  canvas: HTMLCanvasElement,
  imageData: ImageData
): void {
  const ctx = safeGetContext(canvas)
  if (!ctx) return
  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)
}

export function cropImage(
  canvas: HTMLCanvasElement,
  rect: CropRect
): void {
  if (rect.w <= 0 || rect.h <= 0) return
  const ctx = safeGetContext(canvas)
  if (!ctx) return
  const imageData = ctx.getImageData(rect.x, rect.y, rect.w, rect.h)
  canvas.width = rect.w
  canvas.height = rect.h
  ctx.putImageData(imageData, 0, 0)
}

export function simplifyPolygon(
  points: [number, number][],
  epsilon: number
): [number, number][] {
  if (points.length <= 2) return points.slice()

  const stack: [number, number][] = [[0, points.length - 1]]
  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1

  while (stack.length > 0) {
    const seg = stack.pop()!
    const start = seg[0]
    const end = seg[1]
    const first = points[start]
    const last = points[end]

    let dmax = 0
    let index = 0
    for (let i = start + 1; i < end; i++) {
      const d = perpendicularDistance(points[i], first, last)
      if (d > dmax) {
        dmax = d
        index = i
      }
    }

    if (dmax > epsilon) {
      keep[index] = 1
      stack.push([start, index])
      stack.push([index, end])
    }
  }

  const result: [number, number][] = []
  for (let i = 0; i < points.length; i++) {
    if (keep[i]) result.push(points[i])
  }
  return result
}

function perpendicularDistance(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): number {
  const [px, py] = point
  const [sx, sy] = lineStart
  const [ex, ey] = lineEnd
  const dx = ex - sx
  const dy = ey - sy
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return Math.sqrt((px - sx) ** 2 + (py - sy) ** 2)
  return Math.abs(dy * px - dx * py + ex * sy - ey * sx) / len
}

export function downloadImage(
  canvas: HTMLCanvasElement,
  filename = 'image-transparent.png',
  opacity = 100
): void {
  let source = canvas
  if (opacity < 100) {
    source = document.createElement('canvas')
    source.width = canvas.width
    source.height = canvas.height
    const ctx = safeGetContext(source)
    if (!ctx) return
    ctx.drawImage(canvas, 0, 0)
    const imageData = ctx.getImageData(0, 0, source.width, source.height)
    const factor = opacity / 100
    for (let i = 3; i < imageData.data.length; i += 4) {
      imageData.data[i] = Math.round(imageData.data[i] * factor)
    }
    ctx.putImageData(imageData, 0, 0)
  }

  source.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
