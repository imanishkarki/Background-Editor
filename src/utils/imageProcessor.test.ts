import { describe, it, expect } from 'vitest'
import {
  pointInPolygon,
  simplifyPolygon,
  putImageDataOnCanvas,
  createPolygonMask,
  createFreehandMask,
  createMask,
} from './imageProcessor'

describe('pointInPolygon', () => {
  const square: [number, number][] = [[0, 0], [10, 0], [10, 10], [0, 10]]

  it('returns true for points inside', () => {
    expect(pointInPolygon(5, 5, square)).toBe(true)
    expect(pointInPolygon(1, 1, square)).toBe(true)
    expect(pointInPolygon(9, 9, square)).toBe(true)
  })

  it('returns false for points outside', () => {
    expect(pointInPolygon(-1, 5, square)).toBe(false)
    expect(pointInPolygon(5, -1, square)).toBe(false)
    expect(pointInPolygon(11, 5, square)).toBe(false)
    expect(pointInPolygon(5, 11, square)).toBe(false)
  })

  it('handles triangle', () => {
    const triangle: [number, number][] = [[0, 0], [10, 0], [5, 10]]
    expect(pointInPolygon(5, 5, triangle)).toBe(true)
    expect(pointInPolygon(9, 1, triangle)).toBe(true)
    expect(pointInPolygon(11, 0, triangle)).toBe(false)
    expect(pointInPolygon(0, 10, triangle)).toBe(false)
  })

  it('returns false for empty polygon', () => {
    expect(pointInPolygon(0, 0, [])).toBe(false)
  })

  it('returns false for degenerate polygon with <3 points', () => {
    expect(pointInPolygon(5, 5, [[0, 0]])).toBe(false)
    expect(pointInPolygon(5, 5, [[0, 0], [10, 0]])).toBe(false)
  })
})

describe('simplifyPolygon', () => {
  it('returns same array for fewer than 3 points', () => {
    expect(simplifyPolygon([[0, 0]], 1)).toEqual([[0, 0]])
    expect(simplifyPolygon([[0, 0], [1, 1]], 1)).toEqual([[0, 0], [1, 1]])
  })

  it('removes collinear points with high epsilon', () => {
    const points: [number, number][] = [[0, 0], [5, 0], [10, 0], [10, 5], [10, 10]]
    const simplified = simplifyPolygon(points, 2)
    expect(simplified.length).toBeLessThan(points.length)
  })

  it('preserves start and end points', () => {
    const points: [number, number][] = [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]]
    const simplified = simplifyPolygon(points, 1)
    expect(simplified[0]).toEqual([0, 0])
  })
})

describe('createMask', () => {
  it('creates correct mask for a triangle shape', () => {
    const path: [number, number][] = [[0, 0], [5, 0], [5, 5]]
    const mask = createMask(6, 6, path)
    expect(mask.length).toBe(36)
    expect(mask[0]).toBe(1)
    expect(mask[5]).toBe(0)
    expect(mask[35]).toBe(0)
  })
})

describe('createPolygonMask', () => {
  it('creates correct mask for a square', () => {
    const path: [number, number][] = [[0, 0], [4, 0], [4, 4], [0, 4]]
    const mask = createPolygonMask(5, 5, path)
    expect(mask.length).toBe(25)
    expect(mask[0]).toBe(1)
    expect(mask[12]).toBe(1)
    expect(mask[24]).toBe(1)
  })

  it('returns empty mask for empty polygon', () => {
    const mask = createPolygonMask(5, 5, [])
    expect(mask.length).toBe(25)
    expect(mask.every(v => v === 0)).toBe(true)
  })
})

describe('createFreehandMask', () => {
  it('creates correct mask for a triangle', () => {
    const path: [number, number][] = [[0, 0], [5, 0], [5, 5], [0, 5]]
    const mask = createFreehandMask(6, 6, path)
    expect(mask.length).toBe(36)
    expect(mask[0]).toBe(1)
  })
})

describe('putImageDataOnCanvas', () => {
  it('puts image data on canvas', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 2
    const data = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255])
    const imageData = new ImageData(data, 2, 2)
    putImageDataOnCanvas(canvas, imageData)
    const ctx = canvas.getContext('2d')!
    const result = ctx.getImageData(0, 0, 2, 2)
    expect(result.data).toEqual(imageData.data)
  })
})
