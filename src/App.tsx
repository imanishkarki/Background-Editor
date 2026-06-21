import { useCallback, useEffect, useState, useRef, useMemo, type ChangeEvent } from 'react'
import Sidebar from './components/Sidebar'
import CanvasEditor from './components/CanvasEditor'
import ToastBanner from './components/ToastBanner'
import ThemePicker from './components/ThemePicker'
import HelpModal from './components/HelpModal'
import DownloadModal from './components/DownloadModal'
import ContextMenu from './components/ContextMenu'
import BackgroundDecor from './components/BackgroundDecor'
import { useCanvasEditor } from './hooks/useCanvasEditor'
import { useBrush } from './hooks/useBrush'
import { useSelection } from './hooks/useSelection'
import { useTheme } from './hooks/useTheme'
import { useHistory } from './hooks/useHistory'
import { useCrop } from './hooks/useCrop'
import { createPolygonMask, createFreehandMask, removeColorInMask, simplifyPolygon } from './utils/imageProcessor'
import type { BrushType } from './types/image'
import { safeGetContext } from './utils/helpers'

export default function App() {
  const { theme, setTheme } = useTheme()

  const {
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
    clearError,
    handleImageUpload,
    handleCanvasClick,
    handleRemoveColor,
    handleReset,
    handleDownload,
    setSelectedColor,
    refreshDisplay,
    getCurrentImageData,
    restoreFromImageData,
    restoreFromCache,
    clearCache,
    removeImage,
  } = useCanvasEditor()

  const { pushState, undo, redo } = useHistory()

  const {
    cropActive,
    cropRect,
    activateCrop,
    cancelCrop,
    handleCropStart,
    handleCropMove,
    handleCropEnd,
    handleCropConfirm,
    handleCropCancel,
  } = useCrop()

  const captureState = useCallback(() => {
    const data = getCurrentImageData()
    if (data) pushState(data)
  }, [getCurrentImageData, pushState])

  const onBeforeEdit = useCallback(() => {
    captureState()
  }, [captureState])

  const {
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
  } = useBrush({
    offscreenCanvasRef,
    displayCanvasRef,
    originalImageDataRef,
    selectedColor,
    tolerance,
    removalStrength,
    refreshDisplay,
    onBeforeEdit,
  })

  const {
    selectionContour,
    selectionActive,
    startSelection,
    confirmSelection,
    cancelSelection,
  } = useSelection({
    displayCanvasRef,
    offscreenCanvasRef,
    tolerance,
    renderOffscreenToDisplay: refreshDisplay,
    onColorPicked: setSelectedColor,
    onBeforeEdit,
  })

  const [magicWandMode, setMagicWandMode] = useState(false)
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [restoreToast, setRestoreToast] = useState<string | null>(null)
  const mountedRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [imageOpacity, setImageOpacity] = useState(100)

  const [originalFilename, setOriginalFilename] = useState('')
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  const [polygonActive, setPolygonActive] = useState(false)
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([])
  const [polygonClosed, setPolygonClosed] = useState(false)

  const [freeSelectActive, setFreeSelectActive] = useState(false)
  const [freeSelectPoints, setFreeSelectPoints] = useState<[number, number][]>([])
  const [freeSelectClosed, setFreeSelectClosed] = useState(false)

  const suggestedDownloadName = originalFilename
    ? originalFilename.replace(/\.[^.]+$/, '') + '-transparent.png'
    : 'image-transparent.png'

  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })

  const clearPolygon = useCallback(() => {
    setPolygonPoints([])
    setPolygonClosed(false)
    setPolygonActive(false)
  }, [])

  const clearFreehand = useCallback(() => {
    setFreeSelectPoints([])
    setFreeSelectClosed(false)
    setFreeSelectActive(false)
  }, [])

  const handleRemoveColorWithPolygon = useCallback(() => {
    if (!selectedColor || !hasImage) return
    const offscreen = offscreenCanvasRef.current
    if (!offscreen || !offscreen.width || !offscreen.height) return

    const display = displayCanvasRef.current
    if (!display || !display.width || !display.height) return

    const scale = offscreen.width / display.width
    const offscreenPolygon: [number, number][] = polygonPoints.map(
      ([x, y]) => [Math.round(x * scale), Math.round(y * scale)]
    )

    const mask = createPolygonMask(offscreen.width, offscreen.height, offscreenPolygon)

    const ctx = safeGetContext(offscreen)
    if (!ctx) return
    const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height)

    captureState()

    const result = removeColorInMask(imageData, selectedColor.rgb, tolerance, removalStrength, mask)
    ctx.putImageData(result, 0, 0)

    if (originalImageDataRef.current) {
      const origCanvas = document.createElement('canvas')
      const origCtx = safeGetContext(origCanvas)
      if (!origCtx) return
      origCanvas.width = originalImageDataRef.current.width
      origCanvas.height = originalImageDataRef.current.height
      origCtx.putImageData(originalImageDataRef.current, 0, 0)
      const origData = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height)
      const scaleOrig = origCanvas.width / display.width
      const origPolygon: [number, number][] = polygonPoints.map(
        ([x, y]) => [Math.round(x * scaleOrig), Math.round(y * scaleOrig)]
      )
      const origMask = createPolygonMask(origCanvas.width, origCanvas.height, origPolygon)
      const origResult = removeColorInMask(origData, selectedColor.rgb, tolerance, removalStrength, origMask)
      origCtx.putImageData(origResult, 0, 0)
      originalImageDataRef.current = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height)
    }

    refreshDisplay()
    clearPolygon()
  }, [selectedColor, hasImage, offscreenCanvasRef, displayCanvasRef, polygonPoints, tolerance, removalStrength, captureState, originalImageDataRef, refreshDisplay, clearPolygon])

  const handleRemoveColorWithFreehand = useCallback(() => {
    if (!selectedColor || !hasImage) return
    const offscreen = offscreenCanvasRef.current
    if (!offscreen || !offscreen.width || !offscreen.height) return

    const display = displayCanvasRef.current
    if (!display || !display.width || !display.height) return

    const scale = offscreen.width / display.width
    const offscreenPoints: [number, number][] = freeSelectPoints.map(
      ([x, y]) => [Math.round(x * scale), Math.round(y * scale)]
    )

    const mask = createFreehandMask(offscreen.width, offscreen.height, offscreenPoints)

    const ctx = safeGetContext(offscreen)
    if (!ctx) return
    const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height)

    captureState()

    const result = removeColorInMask(imageData, selectedColor.rgb, tolerance, removalStrength, mask)
    ctx.putImageData(result, 0, 0)

    if (originalImageDataRef.current) {
      const origCanvas = document.createElement('canvas')
      const origCtx = safeGetContext(origCanvas)
      if (!origCtx) return
      origCanvas.width = originalImageDataRef.current.width
      origCanvas.height = originalImageDataRef.current.height
      origCtx.putImageData(originalImageDataRef.current, 0, 0)
      const origData = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height)
      const scaleOrig = origCanvas.width / display.width
      const origPoints: [number, number][] = freeSelectPoints.map(
        ([x, y]) => [Math.round(x * scaleOrig), Math.round(y * scaleOrig)]
      )
      const origMask = createFreehandMask(origCanvas.width, origCanvas.height, origPoints)
      const origResult = removeColorInMask(origData, selectedColor.rgb, tolerance, removalStrength, origMask)
      origCtx.putImageData(origResult, 0, 0)
      originalImageDataRef.current = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height)
    }

    refreshDisplay()
    clearFreehand()
  }, [selectedColor, hasImage, offscreenCanvasRef, displayCanvasRef, freeSelectPoints, tolerance, removalStrength, captureState, originalImageDataRef, refreshDisplay, clearFreehand])

  const handleRemoveColorWithHistory = useCallback(() => {
    if (polygonClosed && polygonPoints.length >= 3) {
      handleRemoveColorWithPolygon()
    } else if (freeSelectClosed && freeSelectPoints.length >= 3) {
      handleRemoveColorWithFreehand()
    } else {
      captureState()
      handleRemoveColor()
    }
  }, [polygonClosed, polygonPoints, freeSelectClosed, freeSelectPoints, handleRemoveColorWithPolygon, handleRemoveColorWithFreehand, captureState, handleRemoveColor])

  const handleResetWithHistory = useCallback(() => {
    if (!window.confirm('Reset image to original? This cannot be undone.')) return
    captureState()
    handleReset()
  }, [captureState, handleReset])

  const handleRemoveImage = useCallback(() => {
    if (!window.confirm('Remove image? All edits will be lost.')) return
    captureState()
    removeImage()
  }, [captureState, removeImage])

  const handleClearCache = useCallback(async () => {
    if (!window.confirm('Clear cached session? You will start fresh on next load.')) return
    try {
      await clearCache()
      setRestoreToast('Cache cleared')
    } catch {
      setRestoreToast('Failed to clear cache')
    }
    setTimeout(() => setRestoreToast(null), 2000)
  }, [clearCache])

  useEffect(() => {
    if (!hasImage) setOriginalFilename('')
  }, [hasImage])

  useEffect(() => {
    if (!selectedColor && brushMode && brushType === 'erase') {
      toggleBrushMode()
    }
  }, [selectedColor, brushMode, brushType, toggleBrushMode])

  useEffect(() => {
    if (brushMode || magicWandMode || cropActive || polygonActive || freeSelectActive) {
      if (window.innerWidth < 768) setSidebarOpen(false)
    }
  }, [brushMode, magicWandMode, cropActive, polygonActive, freeSelectActive])

  const onCropTool = useCallback(() => {
    if (cropActive) {
      cancelCrop()
    } else {
      if (polygonPoints.length > 0) clearPolygon()
      if (freeSelectPoints.length > 0) clearFreehand()
      if (brushMode) toggleBrushMode()
      if (magicWandMode) setMagicWandMode(false)
      if (selectionActive) cancelSelection()
      activateCrop()
    }
  }, [cropActive, brushMode, toggleBrushMode, magicWandMode, selectionActive, cancelSelection, activateCrop, cancelCrop, polygonPoints, clearPolygon, freeSelectPoints, clearFreehand])

  const onActivateMagicWand = useCallback(() => {
    if (polygonPoints.length > 0) clearPolygon()
    if (freeSelectPoints.length > 0) clearFreehand()
    if (cropActive) cancelCrop()
    if (magicWandMode) {
      if (selectionActive) cancelSelection()
      setMagicWandMode(false)
    } else {
      if (brushMode) toggleBrushMode()
      if (selectionActive) cancelSelection()
      setMagicWandMode(true)
    }
  }, [magicWandMode, brushMode, toggleBrushMode, selectionActive, cancelSelection, cropActive, cancelCrop, polygonPoints, clearPolygon, freeSelectPoints, clearFreehand])

  const onActivateBrush = useCallback(
    (type: BrushType) => {
      if (type === 'erase' && !selectedColor) return
      if (polygonPoints.length > 0) clearPolygon()
      if (freeSelectPoints.length > 0) clearFreehand()
      if (cropActive) cancelCrop()
      if (brushMode && brushType === type) {
        toggleBrushMode()
      } else {
        setBrushType(type)
        if (!brushMode) toggleBrushMode()
      }
      if (magicWandMode) setMagicWandMode(false)
      if (selectionActive) cancelSelection()
    },
    [selectedColor, brushMode, brushType, setBrushType, toggleBrushMode, magicWandMode, selectionActive, cancelSelection, cropActive, cancelCrop, polygonPoints, clearPolygon, freeSelectPoints, clearFreehand]
  )

  const onCropConfirm = useCallback(() => {
    handleCropConfirm({
      captureState,
      offscreenCanvasRef,
      displayCanvasRef,
      originalImageDataRef,
      refreshDisplay,
    })
  }, [handleCropConfirm, captureState, offscreenCanvasRef, displayCanvasRef, originalImageDataRef, refreshDisplay])

  const onPolygonTool = useCallback(() => {
    if (polygonActive) {
      clearPolygon()
    } else {
      if (brushMode) toggleBrushMode()
      if (magicWandMode) setMagicWandMode(false)
      if (selectionActive) cancelSelection()
      if (cropActive) cancelCrop()
      if (freeSelectPoints.length > 0) clearFreehand()
      setPolygonPoints([])
      setPolygonClosed(false)
      setPolygonActive(true)
    }
  }, [polygonActive, brushMode, toggleBrushMode, magicWandMode, selectionActive, cancelSelection, cropActive, cancelCrop, freeSelectPoints, clearFreehand])

  const onPolygonPoint = useCallback((dx: number, dy: number) => {
    setPolygonPoints((prev) => [...prev, [dx, dy] as [number, number]])
  }, [])

  const onPolygonClose = useCallback(() => {
    setPolygonClosed(true)
    setPolygonActive(false)
  }, [])

  const onFreeSelectTool = useCallback(() => {
    if (freeSelectActive) {
      clearFreehand()
    } else {
      if (brushMode) toggleBrushMode()
      if (magicWandMode) setMagicWandMode(false)
      if (selectionActive) cancelSelection()
      if (cropActive) cancelCrop()
      if (polygonActive) clearPolygon()
      setFreeSelectPoints([])
      setFreeSelectClosed(false)
      setFreeSelectActive(true)
    }
  }, [freeSelectActive, brushMode, toggleBrushMode, magicWandMode, selectionActive, cancelSelection, cropActive, cancelCrop, polygonActive, clearPolygon, clearFreehand])

  const onFreeSelectStart = useCallback((dx: number, dy: number) => {
    setFreeSelectPoints([[dx, dy]])
    setFreeSelectClosed(false)
  }, [])

  const onFreeSelectMove = useCallback((dx: number, dy: number) => {
    setFreeSelectPoints((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      const dist = Math.sqrt((dx - last[0]) ** 2 + (dy - last[1]) ** 2)
      if (dist < 3) return prev
      return [...prev, [dx, dy]]
    })
  }, [])

  const onFreeSelectEnd = useCallback(() => {
    const display = displayCanvasRef.current
    const snapThreshold = display
      ? Math.max(20, Math.min(display.width, display.height) * 0.03)
      : 25
    const simplifyEpsilon = display
      ? Math.max(1, Math.min(display.width, display.height) * 0.005)
      : 2

    setFreeSelectPoints((prev) => {
      if (prev.length < 10) {
        setFreeSelectActive(false)
        return []
      }

      const first = prev[0]
      const last = prev[prev.length - 1]
      const dist = Math.sqrt((last[0] - first[0]) ** 2 + (last[1] - first[1]) ** 2)

      let closedPoints = prev
      if (dist <= snapThreshold) {
        closedPoints = [...prev.slice(0, -1), [first[0], first[1]]]
      }

      const simplified = simplifyPolygon(closedPoints, simplifyEpsilon)

      setFreeSelectClosed(true)
      setFreeSelectActive(false)
      return simplified
    })
  }, [displayCanvasRef])

  const handleUndo = useCallback(() => {
    const current = getCurrentImageData()
    if (!current) return
    const prev = undo(current)
    if (prev) restoreFromImageData(prev)
  }, [getCurrentImageData, undo, restoreFromImageData])

  const handleRedo = useCallback(() => {
    const current = getCurrentImageData()
    if (!current) return
    const next = redo(current)
    if (next) restoreFromImageData(next)
  }, [getCurrentImageData, redo, restoreFromImageData])

  const handleFilePickCb = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setOriginalFilename(file.name)
      handleImageUpload(file)
    }
    if (e.target) e.target.value = ''
  }, [handleImageUpload])

  const handleDownloadWithOpacity = useCallback(() => {
    setShowDownloadModal(true)
  }, [])

  const handleDownloadConfirm = useCallback((name: string) => {
    handleDownload(name, imageOpacity)
    setShowDownloadModal(false)
  }, [handleDownload, imageOpacity])

  const handleContextMenu = useCallback((clientX: number, clientY: number) => {
    setMenuPos({ x: clientX, y: clientY })
    setMenuOpen(true)
  }, [])

  const contextMenuItems = useMemo(() => [
    {
      label: 'Crop Image',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6V4h2m-2 14v2h2m12-16h2v2m0 12v2h-2M4 12h16" /></svg>,
      onClick: onCropTool,
      disabled: !hasImage,
    },
    {
      label: 'Download PNG',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v8m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2v-1M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>,
      onClick: () => setShowDownloadModal(true),
      disabled: !hasImage,
      shortcut: 'Ctrl+S',
    },
    {
      label: 'Reset Image',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
      onClick: handleResetWithHistory,
      disabled: !hasImage,
    },
    {
      label: 'Remove Image',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>,
      onClick: handleRemoveImage,
      disabled: !hasImage,
    },
  ], [hasImage, onCropTool, handleResetWithHistory, handleRemoveImage])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) return

      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        handleRedo()
        return
      }
      if (ctrl && e.key === 'z') {
        e.preventDefault()
        handleUndo()
        return
      }
      if (ctrl && e.key === 'o') {
        e.preventDefault()
        fileInputRef.current?.click()
        return
      }
      if (ctrl && e.key === 's') {
        e.preventDefault()
        setShowDownloadModal(true)
        return
      }
      if (e.key === '[') {
        e.preventDefault()
        setBrushSize((s) => Math.max(5, s - 10))
        return
      }
      if (e.key === ']') {
        e.preventDefault()
        setBrushSize((s) => Math.min(200, s + 10))
        return
      }
      if (cropActive && cropRect) {
        if (e.key === 'Enter' || e.key === 'Delete') {
          e.preventDefault()
          onCropConfirm()
          return
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          cancelCrop()
          return
        }
        return
      }
      if (selectionActive) return
      if (polygonPoints.length > 0 && !polygonClosed) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault()
          setPolygonPoints((prev) => prev.slice(0, -1))
          return
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          clearPolygon()
          return
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          if (polygonPoints.length >= 3) {
            onPolygonClose()
          }
          return
        }
      }
      if (freeSelectPoints.length > 0 && !freeSelectClosed) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault()
          setFreeSelectPoints((prev) => prev.slice(0, -1))
          return
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          clearFreehand()
          return
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          if (freeSelectPoints.length >= 10) {
            onFreeSelectEnd()
          }
          return
        }
      }
      if (e.key === '1') {
        if (selectedColor) onActivateBrush('erase')
        return
      }
      if (e.key === '2') {
        onActivateBrush('restore')
        return
      }
      if (e.key === '3') {
        onActivateMagicWand()
        return
      }
      if (e.key === '4') {
        onPolygonTool()
        return
      }
      if (e.key === '5') {
        onFreeSelectTool()
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleUndo, handleRedo, setBrushSize, cropActive, cropRect, onCropConfirm, cancelCrop, selectionActive, onActivateBrush, onActivateMagicWand, polygonPoints, polygonClosed, clearPolygon, onPolygonClose, onPolygonTool, freeSelectPoints, freeSelectClosed, clearFreehand, onFreeSelectEnd, onFreeSelectTool])

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          e.preventDefault()
          setOriginalFilename('clipboard.png')
          handleImageUpload(file)
          return
        }
      }
    }
  }, [handleImageUpload])

  useEffect(() => {
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true
    restoreFromCache().then((ok) => {
      if (ok) setRestoreToast('Session restored from your last session')
      setTimeout(() => setRestoreToast(null), 4000)
    }).catch(() => {
      setRestoreToast('Could not restore previous session')
      setTimeout(() => setRestoreToast(null), 4000)
    })
  }, [restoreFromCache])

  const handleCanvasClickRouter = useCallback(
    (clientX: number, clientY: number) => {
      if (magicWandMode) {
        const ok = startSelection(clientX, clientY)
        if (!ok) {
          setSelectionError('No valid pixel to select')
          setTimeout(() => setSelectionError(null), 2000)
        }
      } else {
        handleCanvasClick(clientX, clientY)
      }
    },
    [magicWandMode, startSelection, handleCanvasClick]
  )

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFilePickCb}
        className="hidden"
      />
      {theme === 'texture' && <div className="noise-overlay" />}
      <div className={`relative h-screen flex flex-col bg-page ${theme === 'texture' ? 'bg-texture' : 'bg-dotgrid'} transition-colors`}>
        <BackgroundDecor />

        <header
          className="relative z-30 shadow-lg"
          style={{ backgroundImage: 'linear-gradient(to right, var(--header-from), var(--header-to))' }}
        >
          <div className="relative z-10 mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                <div className="bg-white rounded-full p-1.5 shadow">
                  <img src="/abtool.png" alt="Attibabal Tool logo" className="h-12 w-12 rounded-full" />
                </div>
                Attibabal Tool
              </h1>
              <p className="text-xs text-gray-300 font-medium">Upload an image, click a color, and remove it</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="rounded-lg p-1.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors md:hidden btn-min-touch"
                aria-label="Toggle sidebar"
                title="Toggle sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
              <button
                onClick={() => setHelpOpen(true)}
                className="rounded-lg p-1.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors btn-min-touch"
                aria-label="Help"
                title="Help & About"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 17h.01" />
                </svg>
              </button>
              <ThemePicker theme={theme} onChange={setTheme} />
            </div>
          </div>
        </header>

        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
        <DownloadModal
          open={showDownloadModal}
          defaultName={suggestedDownloadName}
          onConfirm={handleDownloadConfirm}
          onCancel={() => setShowDownloadModal(false)}
        />

        <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]">
          <ToastBanner message={error} onDismiss={clearError} variant="error" />
          <ToastBanner message={selectionError} onDismiss={() => setSelectionError(null)} variant="error" />
          <ToastBanner message={restoreToast} onDismiss={() => setRestoreToast(null)} variant="info" />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="relative z-10 flex-1 flex overflow-hidden">
          <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 md:z-auto inset-y-0 left-0 transition-transform duration-200 ease-in-out`}>
            <Sidebar
              onUpload={handleImageUpload}
              hasImage={hasImage}
              brushMode={brushMode}
              brushType={brushType}
              magicWandMode={magicWandMode}
              cropActive={cropActive}
              hasSelectedColor={selectedColor !== null}
              onRemoveColor={handleRemoveColorWithHistory}
              onMagicWand={onActivateMagicWand}
              onCropTool={onCropTool}
              onActivateBrush={onActivateBrush}
              tolerance={tolerance}
              onToleranceChange={setTolerance}
              removalStrength={removalStrength}
              onRemovalStrengthChange={setRemovalStrength}
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              brushOpacity={brushOpacity}
              onBrushOpacityChange={setBrushOpacity}
              brushShape={brushShape}
              onBrushShapeChange={setBrushShape}
              imageOpacity={imageOpacity}
              onImageOpacityChange={setImageOpacity}
              selectedColor={selectedColor}
              selectionActive={selectionActive}
              onConfirmSelection={confirmSelection}
              onCancelSelection={cancelSelection}
              cropRect={cropRect}
              onCropConfirm={onCropConfirm}
              onCropCancel={handleCropCancel}
              onReset={handleResetWithHistory}
              onDownload={handleDownloadWithOpacity}
              onRemoveImage={handleRemoveImage}
              onClearCache={handleClearCache}
              onUndo={handleUndo}
              onRedo={handleRedo}
              polygonActive={polygonActive}
              polygonPoints={polygonPoints}
              polygonClosed={polygonClosed}
              onPolygonTool={onPolygonTool}
              onClearPolygon={clearPolygon}
              freeSelectActive={freeSelectActive}
              freeSelectPoints={freeSelectPoints}
              freeSelectClosed={freeSelectClosed}
              onFreeSelectTool={onFreeSelectTool}
              onClearFreehand={clearFreehand}
            />
          </div>

          <main className="flex-1 flex items-center justify-center p-2 overflow-auto">
            <div className="w-full max-w-5xl">
              <div className="rounded-xl bg-card p-1 border border-divider shadow-sm transition-colors">
                <CanvasEditor
                  displayCanvasRef={displayCanvasRef}
                  onCanvasClick={handleCanvasClickRouter}
                  hasImage={hasImage}
                  brushMode={brushMode}
                  brushSize={brushSize}
                  brushType={brushType}
                  brushShape={brushShape}
                  selectionContour={selectionContour}
                  selectionActive={selectionActive}
                  onBrushStart={handleBrushStart}
                  onBrushStroke={handleBrushMove}
                  onBrushStop={handleBrushStop}
                  cropActive={cropActive}
                  cropRect={cropRect}
                  onCropStart={handleCropStart}
                  onCropMove={handleCropMove}
                  onCropEnd={handleCropEnd}
                  imageOpacity={imageOpacity}
                  onContextMenu={handleContextMenu}
                  polygonActive={polygonActive}
                  polygonPoints={polygonPoints}
                  polygonClosed={polygonClosed}
                  onPolygonPoint={onPolygonPoint}
                  onPolygonClose={onPolygonClose}
                  freeSelectActive={freeSelectActive}
                  freeSelectPoints={freeSelectPoints}
                  freeSelectClosed={freeSelectClosed}
                  onFreeSelectStart={onFreeSelectStart}
                  onFreeSelectMove={onFreeSelectMove}
                  onFreeSelectEnd={onFreeSelectEnd}
                  onDropFile={handleImageUpload}
                  onUploadClick={() => fileInputRef.current?.click()}
                />
              </div>
            </div>
          </main>
        </div>

        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          items={contextMenuItems}
        />
      </div>
    </>
  )
}
