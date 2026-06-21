import { useState, useRef, useCallback } from 'react'
import type { CropRect } from '../types/image'
import { cropImage } from '../utils/imageProcessor'
import { safeGetContext } from '../utils/helpers'

export function useCrop() {
  const [cropActive, setCropActive] = useState(false)
  const [cropRect, setCropRect] = useState<CropRect | null>(null)
  const cropStartRef = useRef<{ x: number; y: number } | null>(null)

  const activateCrop = useCallback(() => {
    setCropActive(true)
    setCropRect(null)
    cropStartRef.current = null
  }, [])

  const cancelCrop = useCallback(() => {
    setCropActive(false)
    setCropRect(null)
    cropStartRef.current = null
  }, [])

  const handleCropStart = useCallback((dx: number, dy: number) => {
    cropStartRef.current = { x: dx, y: dy }
    setCropRect(null)
  }, [])

  const handleCropMove = useCallback((dx: number, dy: number) => {
    const start = cropStartRef.current
    if (!start) return
    const x = Math.min(start.x, dx)
    const y = Math.min(start.y, dy)
    const w = Math.abs(dx - start.x)
    const h = Math.abs(dy - start.y)
    if (w > 0 && h > 0) {
      setCropRect({ x, y, w, h })
    }
  }, [])

  const handleCropEnd = useCallback(() => {
  }, [])

  const handleCropConfirm = useCallback((params: {
    captureState: () => void
    offscreenCanvasRef: React.RefObject<HTMLCanvasElement | null>
    displayCanvasRef: React.RefObject<HTMLCanvasElement | null>
    originalImageDataRef: React.MutableRefObject<ImageData | null>
    refreshDisplay: () => void
  }) => {
    if (!cropRect || cropRect.w === 0 || cropRect.h === 0) return
    const { captureState, offscreenCanvasRef, displayCanvasRef, originalImageDataRef, refreshDisplay } = params

    captureState()

    const offscreen = offscreenCanvasRef.current
    const display = displayCanvasRef.current
    if (!offscreen || !display || !display.width || !display.height) return

    const scale = offscreen.width / display.width
    const offscreenRect: CropRect = {
      x: Math.round(cropRect.x * scale),
      y: Math.round(cropRect.y * scale),
      w: Math.round(cropRect.w * scale),
      h: Math.round(cropRect.h * scale),
    }

    cropImage(offscreen, offscreenRect)

    if (originalImageDataRef.current) {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = originalImageDataRef.current.width
      tempCanvas.height = originalImageDataRef.current.height
      const tempCtx = safeGetContext(tempCanvas)
      if (!tempCtx) return
      tempCtx.putImageData(originalImageDataRef.current, 0, 0)
      cropImage(tempCanvas, offscreenRect)
      originalImageDataRef.current = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
    }

    refreshDisplay()
    setCropActive(false)
    setCropRect(null)
    cropStartRef.current = null
  }, [cropRect])

  const handleCropCancel = useCallback(() => {
    cancelCrop()
  }, [cancelCrop])

  return {
    cropActive,
    cropRect,
    activateCrop,
    cancelCrop,
    handleCropStart,
    handleCropMove,
    handleCropEnd,
    handleCropConfirm,
    handleCropCancel,
  }
}
