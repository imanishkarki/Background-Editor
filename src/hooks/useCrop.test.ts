import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCrop } from './useCrop'

describe('useCrop', () => {
  let result: { current: ReturnType<typeof useCrop> }

  beforeEach(() => {
    result = renderHook(() => useCrop()).result
  })

  it('starts with inactive crop', () => {
    expect(result.current.cropActive).toBe(false)
    expect(result.current.cropRect).toBeNull()
  })

  it('activateCrop sets cropActive to true', () => {
    act(() => result.current.activateCrop())
    expect(result.current.cropActive).toBe(true)
    expect(result.current.cropRect).toBeNull()
  })

  it('cancelCrop sets cropActive to false', () => {
    act(() => result.current.activateCrop())
    act(() => result.current.cancelCrop())
    expect(result.current.cropActive).toBe(false)
    expect(result.current.cropRect).toBeNull()
  })

  it('handleCropStart records start position', () => {
    act(() => result.current.activateCrop())
    act(() => result.current.handleCropStart(10, 20))
  })

  it('handleCropMove updates cropRect', () => {
    act(() => result.current.activateCrop())
    act(() => result.current.handleCropStart(10, 10))
    act(() => result.current.handleCropMove(30, 40))

    expect(result.current.cropRect).not.toBeNull()
    expect(result.current.cropRect!.x).toBe(10)
    expect(result.current.cropRect!.y).toBe(10)
    expect(result.current.cropRect!.w).toBe(20)
    expect(result.current.cropRect!.h).toBe(30)
  })
  
  it('handleCropMove handles negative direction', () => {
    act(() => result.current.activateCrop())
    act(() => result.current.handleCropStart(30, 40))
    act(() => result.current.handleCropMove(10, 20))

    expect(result.current.cropRect!.x).toBe(10)
    expect(result.current.cropRect!.y).toBe(10)
    expect(result.current.cropRect!.w).toBe(20)
    expect(result.current.cropRect!.h).toBe(30)
  })

  it('handleCropMove ignores zero-width drag', () => {
    act(() => result.current.activateCrop())
    act(() => result.current.handleCropStart(10, 10))
    act(() => result.current.handleCropMove(10, 10))
    expect(result.current.cropRect).toBeNull()
  })

  it('handleCropConfirm does nothing when cropRect is null', () => {
    const params = {
      captureState: vi.fn(),
      offscreenCanvasRef: { current: null },
      displayCanvasRef: { current: null },
      originalImageDataRef: { current: null },
      refreshDisplay: vi.fn(),
    }
    act(() => result.current.handleCropConfirm(params))
    expect(params.captureState).not.toHaveBeenCalled()
  })

  it('handleCropConfirm returns early when offscreen not available', () => {
    act(() => result.current.activateCrop())
    act(() => result.current.handleCropStart(5, 5))
    act(() => result.current.handleCropMove(15, 15))

    const params = {
      captureState: vi.fn(),
      offscreenCanvasRef: { current: null },
      displayCanvasRef: { current: document.createElement('canvas') },
      originalImageDataRef: { current: null },
      refreshDisplay: vi.fn(),
    }
    act(() => result.current.handleCropConfirm(params))
    expect(params.captureState).not.toHaveBeenCalled()
  })

  it('handleCropCancel calls cancelCrop', () => {
    act(() => result.current.activateCrop())
    expect(result.current.cropActive).toBe(true)
    act(() => result.current.handleCropCancel())
    expect(result.current.cropActive).toBe(false)
  })
})
