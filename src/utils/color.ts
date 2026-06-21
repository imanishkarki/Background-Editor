import type { RGBColor, SelectedColor } from '../types/image'

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

export function getPixelColor(
  imageData: ImageData,
  x: number,
  y: number
): RGBColor {
  const clampedX = Math.max(0, Math.min(x, imageData.width - 1))
  const clampedY = Math.max(0, Math.min(y, imageData.height - 1))
  const index = (clampedY * imageData.width + clampedX) * 4
  return {
    r: imageData.data[index],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2],
  }
}

export function getSelectedColor(
  imageData: ImageData,
  x: number,
  y: number
): SelectedColor {
  const rgb = getPixelColor(imageData, x, y)
  return {
    rgb,
    hex: rgbToHex(rgb.r, rgb.g, rgb.b),
  }
}
