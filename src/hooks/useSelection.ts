import { useState, useCallback, useEffect, useRef } from 'react'
import type { SelectedColor } from '../types/image'
import { computeSelection, applySelection } from '../utils/imageProcessor'
import { getSelectedColor } from '../utils/color'
import { safeGetContext } from '../utils/helpers'

interface UseSelectionParams {
  displayCanvasRef: React.RefObject<HTMLCanvasElement | null>
  offscreenCanvasRef: React.RefObject<HTMLCanvasElement | null>
  tolerance: number
  renderOffscreenToDisplay: () => void
  onColorPicked: (color: SelectedColor) => void
  onBeforeEdit?: () => void
}

export function useSelection({
  displayCanvasRef,
  offscreenCanvasRef,
  tolerance,
  renderOffscreenToDisplay,
  onColorPicked,
  onBeforeEdit,
}: UseSelectionParams) {
  const [selectionMask, setSelectionMask] = useState<Uint8Array | null>(null)
  const [selectionContour, setSelectionContour] = useState<[number, number][]>([])
  const [selectionActive, setSelectionActive] = useState(false)

  const toleranceRef = useRef(tolerance)
  toleranceRef.current = tolerance

  const startSelection = useCallback((clientX: number, clientY: number): boolean => {
    const canvas = displayCanvasRef.current
    const offscreenCanvas = offscreenCanvasRef.current
    if (!canvas || !offscreenCanvas) return false

    const rect = canvas.getBoundingClientRect()
    const displayX = Math.round((clientX - rect.left) * (canvas.width / rect.width))
    const displayY = Math.round((clientY - rect.top) * (canvas.height / rect.height))

    const ctx = safeGetContext(canvas)
    if (!ctx) return false
    const pixelData = ctx.getImageData(displayX, displayY, 1, 1)
    const color = getSelectedColor(pixelData, 0, 0)
    onColorPicked(color)

    const scale = offscreenCanvas.width / canvas.width
    const ox = Math.round((clientX - rect.left) * (offscreenCanvas.width / rect.width))
    const oy = Math.round((clientY - rect.top) * (offscreenCanvas.height / rect.height))

    const offCtx = safeGetContext(offscreenCanvas)
    if (!offCtx) return false
    const imageData = offCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height)
    const result = computeSelection(imageData, ox, oy, toleranceRef.current)

    if (result) {
      const scaledContour = result.contour.map(([x, y]): [number, number] => [
        Math.round(x / scale),
        Math.round(y / scale),
      ])
      setSelectionMask(result.mask)
      setSelectionContour(scaledContour)
      setSelectionActive(true)
      return true
    }
    return false
  }, [displayCanvasRef, offscreenCanvasRef])

  const confirmSelection = useCallback(() => {
    const offscreenCanvas = offscreenCanvasRef.current
    if (!offscreenCanvas || !selectionMask) return

    if (onBeforeEdit) onBeforeEdit()
    const offCtx = safeGetContext(offscreenCanvas)
    if (!offCtx) return
    const imageData = offCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height)
    const processed = applySelection(imageData, selectionMask)

    if (processed) {
      offCtx.putImageData(processed, 0, 0)
      renderOffscreenToDisplay()
    }

    setSelectionMask(null)
    setSelectionContour([])
    setSelectionActive(false)
  }, [offscreenCanvasRef, selectionMask, renderOffscreenToDisplay, onBeforeEdit])

  const cancelSelection = useCallback(() => {
    setSelectionMask(null)
    setSelectionContour([])
    setSelectionActive(false)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectionActive) return
      if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Enter') {
        e.preventDefault()
        confirmSelection()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        cancelSelection()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectionActive, confirmSelection, cancelSelection])

  return {
    selectionContour,
    selectionActive,
    startSelection,
    confirmSelection,
    cancelSelection,
  }
}
