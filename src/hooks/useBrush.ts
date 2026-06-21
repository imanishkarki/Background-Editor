import { useState, useRef, useCallback, useEffect } from 'react'
import type { SelectedColor, Stroke, BrushType, BrushShape } from '../types/image'
import { getBrushOpacity, getBrushExtents } from '../utils/brushShapes'
import { safeGetContext } from '../utils/helpers'

interface UseBrushParams {
  offscreenCanvasRef: React.RefObject<HTMLCanvasElement | null>
  displayCanvasRef: React.RefObject<HTMLCanvasElement | null>
  originalImageDataRef: React.RefObject<ImageData | null>
  selectedColor: SelectedColor | null
  tolerance: number
  removalStrength: number
  refreshDisplay: () => void
  onBeforeEdit?: () => void
}

export function useBrush({
  offscreenCanvasRef,
  displayCanvasRef,
  originalImageDataRef,
  selectedColor,
  tolerance,
  removalStrength,
  refreshDisplay,
  onBeforeEdit,
}: UseBrushParams) {
  const [brushMode, setBrushMode] = useState(false)
  const [brushSize, setBrushSize] = useState(30)
  const [brushType, setBrushType] = useState<BrushType>('erase')
  const [brushOpacity, setBrushOpacity] = useState(100)
  const [brushShape, setBrushShape] = useState<BrushShape>('circle')

  const pendingStrokesRef = useRef<Stroke[]>([])
  const isDrawingRef = useRef(false)
  const rafIdRef = useRef(0)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const selectedColorRef = useRef(selectedColor)
  const toleranceRef = useRef(tolerance)
  const removalStrengthRef = useRef(removalStrength)
  const refreshDisplayRef = useRef(refreshDisplay)
  const brushTypeRef = useRef<BrushType>(brushType)
  const brushOpacityRef = useRef(brushOpacity)
  const brushShapeRef = useRef<BrushShape>(brushShape)

  selectedColorRef.current = selectedColor
  toleranceRef.current = tolerance
  removalStrengthRef.current = removalStrength
  refreshDisplayRef.current = refreshDisplay
  brushTypeRef.current = brushType
  brushOpacityRef.current = brushOpacity
  brushShapeRef.current = brushShape

  const queueStroke = useCallback(
    (displayX: number, displayY: number) => {
      const displayCanvas = displayCanvasRef.current
      const offscreenCanvas = offscreenCanvasRef.current
      if (!displayCanvas || !offscreenCanvas) return

      const scale = offscreenCanvas.width / displayCanvas.width
      const radius = (brushSize / 2) * scale
      pendingStrokesRef.current.push({
        x: displayX * scale,
        y: displayY * scale,
        radius,
      })
    },
    [brushSize, displayCanvasRef, offscreenCanvasRef]
  )

  const interpolate = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      const dx = x2 - x1
      const dy = y2 - y1
      const dist = Math.sqrt(dx * dx + dy * dy)
      const steps = Math.max(1, Math.floor(dist / 3))
      for (let i = 1; i <= steps; i++) {
        const t = i / steps
        queueStroke(x1 + dx * t, y1 + dy * t)
      }
    },
    [queueStroke]
  )

  const processBatch = useCallback(() => {
    try {
      const strokes = pendingStrokesRef.current.splice(0)
      if (strokes.length === 0) return

      const offscreenCanvas = offscreenCanvasRef.current
      if (!offscreenCanvas) return

      const ctx = safeGetContext(offscreenCanvas)
      if (!ctx) return
      const imageData = ctx.getImageData(
        0,
        0,
        offscreenCanvas.width,
        offscreenCanvas.height
      )
      const { data } = imageData
      const { width, height } = imageData

      const opacityFactor = brushOpacityRef.current / 100
      const strengthFactor = removalStrengthRef.current / 100
      const effectiveFactor = opacityFactor * strengthFactor
      const shape = brushShapeRef.current
      const { ex, ey } = getBrushExtents(shape)

      if (brushTypeRef.current === 'erase') {
        const color = selectedColorRef.current
        if (!color) return
        const { r, g, b } = color.rgb
        const tol = toleranceRef.current

        for (let s = 0; s < strokes.length; s++) {
          const { x, y, radius } = strokes[s]
          const minX = Math.max(0, Math.floor(x - radius * ex))
          const maxX = Math.min(width - 1, Math.ceil(x + radius * ex))
          const minY = Math.max(0, Math.floor(y - radius * ey))
          const maxY = Math.min(height - 1, Math.ceil(y + radius * ey))

          for (let py = minY; py <= maxY; py++) {
            for (let px = minX; px <= maxX; px++) {
              const dx = px - x
              const dy = py - y
              const shapeOpacity = getBrushOpacity(dx, dy, radius, shape)
              if (shapeOpacity <= 0) continue

              const idx = (py * width + px) * 4
              if (
                Math.abs(data[idx] - r) <= tol &&
                Math.abs(data[idx + 1] - g) <= tol &&
                Math.abs(data[idx + 2] - b) <= tol
              ) {
                data[idx + 3] = Math.round(data[idx + 3] * (1 - effectiveFactor * shapeOpacity))
              }
            }
          }
        }
      } else {
        const origData = originalImageDataRef.current
        if (!origData) return
        const origDataArray = origData.data

        for (let s = 0; s < strokes.length; s++) {
          const { x, y, radius } = strokes[s]
          const minX = Math.max(0, Math.floor(x - radius * ex))
          const maxX = Math.min(width - 1, Math.ceil(x + radius * ex))
          const minY = Math.max(0, Math.floor(y - radius * ey))
          const maxY = Math.min(height - 1, Math.ceil(y + radius * ey))

          for (let py = minY; py <= maxY; py++) {
            for (let px = minX; px <= maxX; px++) {
              const dx = px - x
              const dy = py - y
              const shapeOpacity = getBrushOpacity(dx, dy, radius, shape)
              if (shapeOpacity <= 0) continue
              const factor = opacityFactor * shapeOpacity

              const idx = (py * width + px) * 4
              data[idx] = Math.round(data[idx] + (origDataArray[idx] - data[idx]) * factor)
              data[idx + 1] = Math.round(data[idx + 1] + (origDataArray[idx + 1] - data[idx + 1]) * factor)
              data[idx + 2] = Math.round(data[idx + 2] + (origDataArray[idx + 2] - data[idx + 2]) * factor)
              data[idx + 3] = Math.round(data[idx + 3] + (origDataArray[idx + 3] - data[idx + 3]) * factor)
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)
      refreshDisplayRef.current()
    } catch {
      // brush processing failed silently
    }
  }, [offscreenCanvasRef, originalImageDataRef])

  const rafLoop = useCallback(() => {
    processBatch()
    if (isDrawingRef.current || pendingStrokesRef.current.length > 0) {
      rafIdRef.current = requestAnimationFrame(rafLoop)
    } else {
      rafIdRef.current = 0
    }
  }, [processBatch])

  const startRaf = useCallback(() => {
    if (rafIdRef.current === 0) {
      rafIdRef.current = requestAnimationFrame(rafLoop)
    }
  }, [rafLoop])

  const handleBrushStart = useCallback(
    (displayX: number, displayY: number) => {
      if (!isDrawingRef.current && onBeforeEdit) onBeforeEdit()
      isDrawingRef.current = true
      lastPointRef.current = { x: displayX, y: displayY }
      queueStroke(displayX, displayY)
      startRaf()
    },
    [queueStroke, startRaf, onBeforeEdit]
  )

  const handleBrushMove = useCallback(
    (displayX: number, displayY: number) => {
      if (!isDrawingRef.current || !lastPointRef.current) return
      interpolate(lastPointRef.current.x, lastPointRef.current.y, displayX, displayY)
      lastPointRef.current = { x: displayX, y: displayY }
    },
    [interpolate]
  )

  const handleBrushStop = useCallback(() => {
    isDrawingRef.current = false
    lastPointRef.current = null
  }, [])

  const toggleBrushMode = useCallback(() => {
    setBrushMode((prev) => !prev)
  }, [])

  const cleanupBrush = useCallback(() => {
    isDrawingRef.current = false
    pendingStrokesRef.current = []
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = 0
    }
  }, [])

  useEffect(() => {
    return cleanupBrush
  }, [cleanupBrush])

  return {
    brushMode,
    brushSize,
    brushType,
    brushOpacity,
    brushShape,
    setBrushSize,
    setBrushType,
    setBrushOpacity,
    setBrushShape,
    toggleBrushMode,
    handleBrushStart,
    handleBrushMove,
    handleBrushStop,
  }
}
