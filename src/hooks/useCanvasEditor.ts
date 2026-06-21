import { useState, useRef, useCallback } from 'react'
import type { SelectedColor } from '../types/image'
import {
  loadImage,
  renderFullResolution,
  renderToDisplay,
  removeColor,
  putImageDataOnCanvas,
  downloadImage,
} from '../utils/imageProcessor'
import { getSelectedColor } from '../utils/color'
import { saveImageData, loadImageData, clearAllImageData } from '../utils/cache'
import { safeGetContext } from '../utils/helpers'

const DISPLAY_MAX_W = 800
const DISPLAY_MAX_H = 600

export function useCanvasEditor() {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const originalImageDataRef = useRef<ImageData | null>(null)

  const [selectedColor, setSelectedColor] = useState<SelectedColor | null>(null)
  const [tolerance, setTolerance] = useState(20)
  const [removalStrength, setRemovalStrength] = useState(100)
  const [hasImage, setHasImage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const renderOffscreenToDisplay = useCallback(() => {
    const displayCanvas = displayCanvasRef.current
    const offscreenCanvas = offscreenCanvasRef.current
    if (!displayCanvas || !offscreenCanvas) return

    renderToDisplay(
      displayCanvas,
      offscreenCanvas,
      DISPLAY_MAX_W,
      DISPLAY_MAX_H
    )
  }, [])

  const getCurrentImageData = useCallback((): ImageData | null => {
    const canvas = offscreenCanvasRef.current
    if (!canvas) return null
    const ctx = safeGetContext(canvas)
    if (!ctx) return null
    return ctx.getImageData(0, 0, canvas.width, canvas.height)
  }, [])

  const saveCurrentToCache = useCallback(() => {
    const data = getCurrentImageData()
    if (data) saveImageData('current', data).catch(() => {})
  }, [getCurrentImageData])

  const handleImageUpload = useCallback(async (file: File) => {
    setError(null)

    if (!file.type.match(/^image\/(png|jpeg|webp)$/)) {
      setError('Unsupported file format. Use PNG, JPEG, or WebP.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File too large. Maximum size is 20 MB.')
      return
    }

    try {
      const img = await loadImage(file)

      const offscreenCanvas = document.createElement('canvas')
      offscreenCanvasRef.current = offscreenCanvas

      const imageData = renderFullResolution(offscreenCanvas, img)
      originalImageDataRef.current = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
      )

      renderOffscreenToDisplay()
      setSelectedColor(null)
      setHasImage(true)

      saveImageData('original', originalImageDataRef.current).catch(() => {})
      saveCurrentToCache()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load image.'
      setError(message)
    }
  }, [renderOffscreenToDisplay, saveCurrentToCache])

  const handleCanvasClick = useCallback((clientX: number, clientY: number) => {
    const canvas = displayCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.round((clientX - rect.left) * (canvas.width / rect.width))
    const y = Math.round((clientY - rect.top) * (canvas.height / rect.height))

    const ctx = safeGetContext(canvas)
    if (!ctx) return
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const color = getSelectedColor(imageData, x, y)
    setSelectedColor(color)
  }, [])

  const handleRemoveColor = useCallback(() => {
    if (!selectedColor || !originalImageDataRef.current) return

    const imageData = new ImageData(
      new Uint8ClampedArray(originalImageDataRef.current.data),
      originalImageDataRef.current.width,
      originalImageDataRef.current.height
    )

    const processed = removeColor(imageData, selectedColor.rgb, tolerance, removalStrength)

    const offscreenCanvas = offscreenCanvasRef.current
    if (offscreenCanvas) {
      putImageDataOnCanvas(offscreenCanvas, processed)
    }

    renderOffscreenToDisplay()
  }, [selectedColor, tolerance, removalStrength, renderOffscreenToDisplay])

  const handleReset = useCallback(() => {
    if (!originalImageDataRef.current) return

    const offscreenCanvas = offscreenCanvasRef.current
    if (offscreenCanvas) {
      putImageDataOnCanvas(offscreenCanvas, originalImageDataRef.current)
    }

    renderOffscreenToDisplay()
    setSelectedColor(null)
  }, [renderOffscreenToDisplay])

  const handleDownload = useCallback((filename: string, opacity = 100) => {
    const offscreenCanvas = offscreenCanvasRef.current
    if (!offscreenCanvas) return
    downloadImage(offscreenCanvas, filename, opacity)
  }, [])

  const restoreFromImageData = useCallback((data: ImageData) => {
    const offscreenCanvas = offscreenCanvasRef.current
    if (!offscreenCanvas) return
    putImageDataOnCanvas(offscreenCanvas, data)
    setSelectedColor(null)
    setHasImage(true)
    renderOffscreenToDisplay()
  }, [renderOffscreenToDisplay])

  const restoreFromCache = useCallback(async (): Promise<boolean> => {
    const data = await loadImageData('current')
    if (!data) return false

    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvasRef.current = offscreenCanvas

    const original = await loadImageData('original')
    if (original) {
      originalImageDataRef.current = new ImageData(
        new Uint8ClampedArray(original.data),
        original.width,
        original.height
      )
    }

    putImageDataOnCanvas(offscreenCanvas, data)
    setSelectedColor(null)
    setHasImage(true)
    renderOffscreenToDisplay()
    return true
  }, [renderOffscreenToDisplay])

  const clearCache = useCallback(async () => {
    await clearAllImageData()
  }, [])

  const removeImage = useCallback(() => {
    const offscreenCanvas = offscreenCanvasRef.current
    if (!offscreenCanvas) return

    const ctx = safeGetContext(offscreenCanvas)
    if (ctx) ctx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height)

    const displayCanvas = displayCanvasRef.current
    if (displayCanvas) {
      const dCtx = safeGetContext(displayCanvas)
      if (dCtx) dCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height)
    }

    originalImageDataRef.current = null
    offscreenCanvasRef.current = null
    setHasImage(false)
    setSelectedColor(null)
  }, [])

  return {
    displayCanvasRef,
    offscreenCanvasRef,
    originalImageDataRef,
    selectedColor,
    tolerance,
    removalStrength,
    hasImage,
    error,
    setTolerance,
    setRemovalStrength,
    setSelectedColor,
    clearError,
    handleImageUpload,
    handleCanvasClick,
    handleRemoveColor,
    handleReset,
    handleDownload,
    refreshDisplay: renderOffscreenToDisplay,
    getCurrentImageData,
    restoreFromImageData,
    restoreFromCache,
    clearCache,
    removeImage,
  }
}
