export interface RGBColor {
  r: number
  g: number
  b: number
}

export interface SelectedColor {
  hex: string
  rgb: RGBColor
}

export interface Stroke {
  x: number
  y: number
  radius: number
}

export type BrushType = 'erase' | 'restore'
export type BrushShape = 'circle' | 'square' | 'diamond' | 'round' | 'flat' | 'dry' | 'splatter' | 'fan'

export interface SelectionResult {
  mask: Uint8Array
  contour: [number, number][]
}

export interface CropRect {
  x: number
  y: number
  w: number
  h: number
}
