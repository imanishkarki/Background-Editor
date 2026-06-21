import { describe, it, expect, vi } from 'vitest'
import { safeGetContext } from './helpers'

describe('safeGetContext', () => {
  it('returns 2d context when available', () => {
    const canvas = document.createElement('canvas')
    const ctx = safeGetContext(canvas)
    expect(ctx).not.toBeNull()
    expect(ctx!.canvas).toBe(canvas)
  })

  it('returns null when getContext throws', () => {
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockImplementation(() => { throw new Error('canvas disabled') })
    const ctx = safeGetContext(canvas)
    expect(ctx).toBeNull()
  })

  it('returns null when getContext returns null', () => {
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue(null)
    const ctx = safeGetContext(canvas)
    expect(ctx).toBeNull()
  })
})
