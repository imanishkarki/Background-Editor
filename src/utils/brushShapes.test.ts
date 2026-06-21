import { describe, it, expect } from 'vitest'
import { getBrushExtents, getBrushOpacity } from './brushShapes'

describe('getBrushExtents', () => {
  it('returns 1.0 for basic shapes', () => {
    expect(getBrushExtents('circle')).toEqual({ ex: 1.0, ey: 1.0 })
    expect(getBrushExtents('square')).toEqual({ ex: 1.0, ey: 1.0 })
    expect(getBrushExtents('diamond')).toEqual({ ex: 1.0, ey: 1.0 })
    expect(getBrushExtents('round')).toEqual({ ex: 1.0, ey: 1.0 })
  })

  it('returns wide extents for flat brush', () => {
    expect(getBrushExtents('flat')).toEqual({ ex: 2.0, ey: 0.25 })
  })

  it('returns larger extents for dry/splatter', () => {
    const dry = getBrushExtents('dry')
    expect(dry.ex).toBeGreaterThan(1)
    expect(dry.ey).toBeGreaterThan(1)
    const splatter = getBrushExtents('splatter')
    expect(splatter.ex).toBeGreaterThan(1)
    expect(splatter.ey).toBeGreaterThan(1)
  })

  it('returns fan extents', () => {
    expect(getBrushExtents('fan')).toEqual({ ex: 2.0, ey: 0.5 })
  })

  it('handles unknown shape gracefully', () => {
    expect(getBrushExtents('unknown' as any)).toEqual({ ex: 1.0, ey: 1.0 })
  })
})

describe('getBrushOpacity', () => {
  it('returns 0 for radius < 1', () => {
    expect(getBrushOpacity(0, 0, 0, 'circle')).toBe(0)
  })

  it('circle: center is opaque, outside is transparent', () => {
    expect(getBrushOpacity(0, 0, 10, 'circle')).toBe(1)
    expect(getBrushOpacity(10, 0, 10, 'circle')).toBe(0)
    expect(getBrushOpacity(15, 0, 10, 'circle')).toBe(0)
  })

  it('square: axis-aligned shape', () => {
    expect(getBrushOpacity(0, 0, 10, 'square')).toBe(1)
    expect(getBrushOpacity(9, 9, 10, 'square')).toBe(1)
    expect(getBrushOpacity(11, 0, 10, 'square')).toBe(0)
  })

  it('diamond: manhattan distance <= radius', () => {
    expect(getBrushOpacity(0, 0, 10, 'diamond')).toBe(1)
    expect(getBrushOpacity(5, 5, 10, 'diamond')).toBe(1)
    expect(getBrushOpacity(6, 6, 10, 'diamond')).toBe(0)
  })

  it('round: smooth falloff', () => {
    const center = getBrushOpacity(0, 0, 10, 'round')
    expect(center).toBe(1)
    const edge = getBrushOpacity(10, 0, 10, 'round')
    expect(edge).toBe(0)
    const middle = getBrushOpacity(5, 0, 10, 'round')
    expect(middle).toBeGreaterThan(0)
    expect(middle).toBeLessThan(1)
  })
})
