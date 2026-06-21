import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHistory } from './useHistory'

function makeImageData(w = 4, h = 4, fill = 100): ImageData {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = fill
    data[i * 4 + 1] = fill
    data[i * 4 + 2] = fill
    data[i * 4 + 3] = 255
  }
  return new ImageData(data, w, h)
}

describe('useHistory', () => {
  let result: { current: ReturnType<typeof useHistory> }

  beforeEach(() => {
    result = renderHook(() => useHistory()).result
  })

  it('pushState adds to history', () => {
    const data = makeImageData()
    act(() => result.current.pushState(data))
    const undoResult = act(() => result.current.undo(makeImageData(4, 4, 200)))
    expect(undoResult).not.toBeNull()
  })

  it('undo returns null when history is empty', () => {
    const current = makeImageData()
    const prev = act(() => result.current.undo(current))
    expect(prev).toBeNull()
  })

  it('redo returns null when future is empty', () => {
    const current = makeImageData()
    const next = act(() => result.current.redo(current))
    expect(next).toBeNull()
  })

  it('undo returns the previously pushed state', () => {
    const img1 = makeImageData(4, 4, 50)
    const img2 = makeImageData(4, 4, 100)

    act(() => result.current.pushState(img1))
    act(() => result.current.pushState(img2))

    const undo1 = act(() => result.current.undo(makeImageData(4, 4, 150)))
    expect(undo1).not.toBeNull()
    const firstPixel1 = undo1!.data[0]
    expect(firstPixel1).toBe(100)

    const undo2 = act(() => result.current.undo(makeImageData(4, 4, 150)))
    expect(undo2).not.toBeNull()
    const firstPixel2 = undo2!.data[0]
    expect(firstPixel2).toBe(50)
  })

  it('redo returns the undone state', () => {
    const img1 = makeImageData(4, 4, 50)
    const img2 = makeImageData(4, 4, 100)

    act(() => result.current.pushState(img1))
    act(() => result.current.pushState(img2))

    act(() => result.current.undo(makeImageData(4, 4, 150)))
    const redoResult = act(() => result.current.redo(makeImageData(4, 4, 150)))
    expect(redoResult).not.toBeNull()
    const firstPixel = redoResult!.data[0]
    expect(firstPixel).toBe(100)
  })

  it('pushState clears future stack', () => {
    const img1 = makeImageData(4, 4, 50)
    const img2 = makeImageData(4, 4, 100)

    act(() => result.current.pushState(img1))
    act(() => result.current.pushState(img2))

    act(() => result.current.undo(makeImageData(4, 4, 150)))
    act(() => result.current.pushState(makeImageData(4, 4, 200)))

    const redoResult = act(() => result.current.redo(makeImageData(4, 4, 150)))
    expect(redoResult).toBeNull()
  })

  it('enforces max history limit of 10', () => {
    for (let i = 0; i < 15; i++) {
      act(() => result.current.pushState(makeImageData(4, 4, i * 10)))
    }

    let undoCount = 0
    let lastData = makeImageData(4, 4, 999)
    while (true) {
      const prev = act(() => result.current.undo(lastData))
      if (!prev) break
      undoCount++
      lastData = prev
    }
    expect(undoCount).toBe(10)
  })

  it('clones ImageData on pushState (immutable history)', () => {
    const original = makeImageData(4, 4, 50)
    act(() => result.current.pushState(original))

    original.data[0] = 255
    original.data[1] = 255
    original.data[2] = 255

    const restored = act(() => result.current.undo(makeImageData(4, 4, 999)))
    expect(restored).not.toBeNull()
    expect(restored!.data[0]).toBe(50)
    expect(restored!.data[1]).toBe(50)
    expect(restored!.data[2]).toBe(50)
  })
})
