import { useCallback, useState, useRef, useLayoutEffect, useEffect } from 'react'
import type { BrushType, BrushShape, CropRect } from '../types/image'
import { pointInPolygon } from '../utils/imageProcessor'
import SelectionOverlay from './SelectionOverlay'
import CropOverlay from './CropOverlay'
import PolygonOverlay from './PolygonOverlay'
import FreeSelectOverlay from './FreeSelectOverlay'

interface CanvasEditorProps {
  displayCanvasRef: React.RefObject<HTMLCanvasElement | null>
  onCanvasClick: (clientX: number, clientY: number) => void
  hasImage: boolean
  brushMode: boolean
  brushSize: number
  brushType: BrushType
  brushShape: BrushShape
  selectionContour: [number, number][]
  selectionActive: boolean
  onBrushStart: (x: number, y: number) => void
  onBrushStroke: (x: number, y: number) => void
  onBrushStop: () => void
  cropActive: boolean
  cropRect: CropRect | null
  onCropStart: (displayX: number, displayY: number) => void
  onCropMove: (displayX: number, displayY: number) => void
  onCropEnd: () => void
  imageOpacity: number
  onContextMenu: (clientX: number, clientY: number) => void

  polygonActive: boolean
  polygonPoints: [number, number][]
  polygonClosed: boolean
  onPolygonPoint: (displayX: number, displayY: number) => void
  onPolygonClose: () => void

  freeSelectActive: boolean
  freeSelectPoints: [number, number][]
  freeSelectClosed: boolean
  onFreeSelectStart: (displayX: number, displayY: number) => void
  onFreeSelectMove: (displayX: number, displayY: number) => void
  onFreeSelectEnd: () => void

  onDropFile?: (file: File) => void
  onUploadClick?: () => void
}

const BRUSH_COLORS: Record<BrushType, { border: string; inner: string }> = {
  erase: { border: 'border-red-500/60', inner: 'border-red-900/30' },
  restore: { border: 'border-blue-500/60', inner: 'border-blue-900/30' },
}

export default function CanvasEditor({
  displayCanvasRef,
  onCanvasClick,
  hasImage,
  brushMode,
  brushSize,
  brushType,
  brushShape,
  selectionContour,
  selectionActive,
  onBrushStart,
  onBrushStroke,
  onBrushStop,
  cropActive,
  cropRect,
  onCropStart,
  onCropMove,
  onCropEnd,
  imageOpacity,
  onContextMenu,

  polygonActive,
  polygonPoints,
  polygonClosed,
  onPolygonPoint,
  onPolygonClose,

  freeSelectActive,
  freeSelectPoints,
  freeSelectClosed,
  onFreeSelectStart,
  onFreeSelectMove,
  onFreeSelectEnd,
  onDropFile,
  onUploadClick,
}: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)
  const [canvasOffset, setCanvasOffset] = useState({ left: 0, top: 0 })
  const [polygonMousePos, setPolygonMousePos] = useState<{ x: number; y: number } | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const freehandDrawingRef = useRef(false)
  const touchHandledTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const canvasWidth = displayCanvasRef.current?.width ?? 0
  const canvasHeight = displayCanvasRef.current?.height ?? 0

  const updateOffset = useCallback(() => {
    const container = containerRef.current
    const canvas = displayCanvasRef.current
    if (!container || !canvas) return
    const cr = container.getBoundingClientRect()
    const vr = canvas.getBoundingClientRect()
    setCanvasOffset({ left: vr.left - cr.left, top: vr.top - cr.top })
  }, [])

  useLayoutEffect(() => {
    updateOffset()
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(updateOffset)
    ro.observe(container)
    window.addEventListener('resize', updateOffset)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateOffset)
    }
  }, [displayCanvasRef, canvasWidth, canvasHeight, updateOffset])

  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const canvas = displayCanvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return {
        x: Math.round((clientX - rect.left) * (canvas.width / rect.width)),
        y: Math.round((clientY - rect.top) * (canvas.height / rect.height)),
      }
    },
    [displayCanvasRef]
  )

  const getCursorPos = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const container = containerRef.current
      if (!container) return null
      const rect = container.getBoundingClientRect()
      return { x: clientX - rect.left, y: clientY - rect.top }
    },
    []
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      if (!hasImage) return
      onContextMenu(e.clientX, e.clientY)
    },
    [hasImage, onContextMenu]
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!hasImage || brushMode || cropActive) return
      if (touchHandledRef.current) return
      if (polygonActive && !polygonClosed) {
        const { x, y } = getCanvasCoords(e.clientX, e.clientY)
        if (polygonPoints.length >= 3) {
          const first = polygonPoints[0]
          const dist = Math.sqrt((x - first[0]) ** 2 + (y - first[1]) ** 2)
          if (dist <= 8) {
            onPolygonClose()
            return
          }
        }
        onPolygonPoint(x, y)
        return
      }
      if (polygonClosed && polygonPoints.length >= 3) {
        const { x, y } = getCanvasCoords(e.clientX, e.clientY)
        if (!pointInPolygon(x, y, polygonPoints)) return
      }
      if (freeSelectClosed && freeSelectPoints.length >= 3) {
        const { x, y } = getCanvasCoords(e.clientX, e.clientY)
        if (!pointInPolygon(x, y, freeSelectPoints)) return
      }
      onCanvasClick(e.clientX, e.clientY)
    },
    [hasImage, brushMode, cropActive, polygonActive, polygonClosed, polygonPoints, onPolygonPoint, onPolygonClose, freeSelectClosed, freeSelectPoints, onCanvasClick, getCanvasCoords]
  )

  const dragCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      dragCleanupRef.current?.()
      if (touchHandledTimerRef.current) clearTimeout(touchHandledTimerRef.current)
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)
    }
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!hasImage) return
      e.preventDefault()
      if (cropActive) {
        const { x, y } = getCanvasCoords(e.clientX, e.clientY)
        onCropStart(x, y)

        dragCleanupRef.current?.()
        const globalMove = (me: globalThis.MouseEvent) => {
          const coords = getCanvasCoords(me.clientX, me.clientY)
          const canvas = displayCanvasRef.current
          if (canvas) {
            coords.x = Math.max(0, Math.min(coords.x, canvas.width))
            coords.y = Math.max(0, Math.min(coords.y, canvas.height))
          }
          onCropMove(coords.x, coords.y)
        }
        const globalUp = () => {
          onCropEnd()
          window.removeEventListener('mousemove', globalMove)
          window.removeEventListener('mouseup', globalUp)
          dragCleanupRef.current = null
        }
        window.addEventListener('mousemove', globalMove)
        window.addEventListener('mouseup', globalUp)
        dragCleanupRef.current = () => {
          window.removeEventListener('mousemove', globalMove)
          window.removeEventListener('mouseup', globalUp)
        }
      } else if (brushMode) {
        setCursorPos(getCursorPos(e.clientX, e.clientY))
        const { x, y } = getCanvasCoords(e.clientX, e.clientY)
        onBrushStart(x, y)
      } else if (freeSelectActive && !freeSelectClosed) {
        freehandDrawingRef.current = true
        const { x, y } = getCanvasCoords(e.clientX, e.clientY)
        onFreeSelectStart(x, y)
      }
    },
    [hasImage, cropActive, brushMode, freeSelectActive, freeSelectClosed, getCursorPos, getCanvasCoords, onCropStart, onCropMove, onCropEnd, displayCanvasRef, onFreeSelectStart]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!hasImage) return
      const { x, y } = getCanvasCoords(e.clientX, e.clientY)
      if (brushMode) {
        setCursorPos(getCursorPos(e.clientX, e.clientY))
        onBrushStroke(x, y)
      }
      if ((polygonActive && !polygonClosed) || (freehandDrawingRef.current && freeSelectActive && !freeSelectClosed)) {
        setPolygonMousePos({ x, y })
      }
      if (freehandDrawingRef.current && freeSelectActive && !freeSelectClosed) {
        onFreeSelectMove(x, y)
      }
    },
    [hasImage, brushMode, polygonActive, polygonClosed, freeSelectActive, freeSelectClosed, getCursorPos, getCanvasCoords, onBrushStroke, onFreeSelectMove]
  )

  const handleMouseUp = useCallback(
    () => {
      if (brushMode) onBrushStop()
      if (freehandDrawingRef.current) {
        freehandDrawingRef.current = false
        onFreeSelectEnd()
      }
    },
    [brushMode, onBrushStop, onFreeSelectEnd]
  )

  const handleMouseLeave = useCallback(() => {
    setCursorPos(null)
    setPolygonMousePos(null)
    if (brushMode) onBrushStop()
    if (freehandDrawingRef.current) {
      freehandDrawingRef.current = false
    }
  }, [brushMode, onBrushStop])

  const touchCropRef = useRef(false)
  const touchHandledRef = useRef(false)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressPosRef = useRef<{ x: number; y: number } | null>(null)

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!hasImage) return
      clearLongPress()
      touchHandledRef.current = true
      touchHandledTimerRef.current = setTimeout(() => { touchHandledRef.current = false }, 300)

      const touch = e.touches[0]

      if (cropActive) {
        e.preventDefault()
        touchCropRef.current = true
        const { x, y } = getCanvasCoords(touch.clientX, touch.clientY)
        const canvas = displayCanvasRef.current
        if (canvas) {
          onCropStart(
            Math.max(0, Math.min(x, canvas.width)),
            Math.max(0, Math.min(y, canvas.height))
          )
        }
        return
      }

      if (freeSelectActive && !freeSelectClosed) {
        e.preventDefault()
        freehandDrawingRef.current = true
        const { x, y } = getCanvasCoords(touch.clientX, touch.clientY)
        onFreeSelectStart(x, y)
        return
      }

      if (brushMode) {
        e.preventDefault()
        setCursorPos(getCursorPos(touch.clientX, touch.clientY))
        const { x, y } = getCanvasCoords(touch.clientX, touch.clientY)
        onBrushStart(x, y)
        return
      }

      longPressPosRef.current = { x: touch.clientX, y: touch.clientY }
      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null
        if (longPressPosRef.current) {
          onContextMenu(longPressPosRef.current.x, longPressPosRef.current.y)
          longPressPosRef.current = null
        }
      }, 500)

      const { x, y } = getCanvasCoords(touch.clientX, touch.clientY)

      if (polygonActive && !polygonClosed) {
        e.preventDefault()
        if (polygonPoints.length >= 3) {
          const first = polygonPoints[0]
          const dist = Math.sqrt((x - first[0]) ** 2 + (y - first[1]) ** 2)
          if (dist <= 8) {
            onPolygonClose()
            return
          }
        }
        onPolygonPoint(x, y)
        return
      }
      if (polygonClosed && polygonPoints.length >= 3) {
        const inside = pointInPolygon(x, y, polygonPoints)
        if (!inside) return
      }
      if (freeSelectClosed && freeSelectPoints.length >= 3) {
        const inside = pointInPolygon(x, y, freeSelectPoints)
        if (!inside) return
      }
      onCanvasClick(touch.clientX, touch.clientY)
    },
    [hasImage, brushMode, freeSelectActive, freeSelectClosed, cropActive, polygonActive, polygonClosed, polygonPoints, freeSelectPoints, getCursorPos, getCanvasCoords, onBrushStart, onFreeSelectStart, onCropStart, onPolygonPoint, onPolygonClose, onCanvasClick, onContextMenu, clearLongPress]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!hasImage) return
      clearLongPress()
      const touch = e.touches[0]
      if (touchCropRef.current) {
        e.preventDefault()
        const { x, y } = getCanvasCoords(touch.clientX, touch.clientY)
        const canvas = displayCanvasRef.current
        if (canvas) {
          onCropMove(
            Math.max(0, Math.min(x, canvas.width)),
            Math.max(0, Math.min(y, canvas.height))
          )
        }
      } else if (brushMode) {
        e.preventDefault()
        setCursorPos(getCursorPos(touch.clientX, touch.clientY))
        const { x, y } = getCanvasCoords(touch.clientX, touch.clientY)
        onBrushStroke(x, y)
      }
      if (freehandDrawingRef.current && freeSelectActive && !freeSelectClosed) {
        e.preventDefault()
        const { x, y } = getCanvasCoords(touch.clientX, touch.clientY)
        onFreeSelectMove(x, y)
      }
    },
    [hasImage, brushMode, freeSelectActive, freeSelectClosed, displayCanvasRef, getCursorPos, getCanvasCoords, onBrushStroke, onFreeSelectMove, onCropMove, clearLongPress]
  )

  const handleTouchEnd = useCallback(() => {
    clearLongPress()
    setCursorPos(null)
    if (touchCropRef.current) {
      touchCropRef.current = false
      onCropEnd()
    }
    if (brushMode) onBrushStop()
    if (freehandDrawingRef.current) {
      freehandDrawingRef.current = false
      onFreeSelectEnd()
    }
  }, [brushMode, onBrushStop, onFreeSelectEnd, onCropEnd, clearLongPress])

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!hasImage || !polygonActive || polygonClosed) return
      if (polygonPoints.length >= 3) {
        const { x, y } = getCanvasCoords(e.clientX, e.clientY)
        onPolygonPoint(x, y)
        onPolygonClose()
      }
    },
    [hasImage, polygonActive, polygonClosed, polygonPoints, getCanvasCoords, onPolygonPoint, onPolygonClose]
  )

  const colors = BRUSH_COLORS[brushType]

  const cursorClass = !hasImage
    ? 'hidden'
    : cropActive
      ? 'cursor-crosshair'
      : brushMode
        ? 'cursor-none'
        : 'cursor-crosshair'

  return (
    <div
      ref={containerRef}
      className={`checkerboard relative flex items-center justify-center rounded-xl border-2 border-dashed bg-surface p-2 min-h-[320px] w-full overflow-hidden transition-colors ${
        isDragOver
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
          : 'border-divider'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) onDropFile?.(file)
      }}
    >
      <canvas
        ref={displayCanvasRef}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        className={`rounded-lg shadow-sm ${cursorClass}`}
        style={{
          imageRendering: 'auto',
          touchAction: (brushMode || cropActive || (freeSelectActive && !freeSelectClosed)) ? 'none' : undefined,
          opacity: imageOpacity / 100,
        }}
      />
      <SelectionOverlay
        contour={selectionContour}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        isActive={selectionActive}
        offsetLeft={canvasOffset.left}
        offsetTop={canvasOffset.top}
      />
      <CropOverlay
        cropRect={cropRect}
        offsetLeft={canvasOffset.left}
        offsetTop={canvasOffset.top}
        isActive={cropActive}
      />
      <PolygonOverlay
        points={polygonPoints}
        closed={polygonClosed}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        offsetLeft={canvasOffset.left}
        offsetTop={canvasOffset.top}
      />
      <FreeSelectOverlay
        points={freeSelectPoints}
        closed={freeSelectClosed}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        offsetLeft={canvasOffset.left}
        offsetTop={canvasOffset.top}
      />
      {polygonActive && !polygonClosed && polygonPoints.length > 0 && polygonMousePos && (
        <svg
          className="pointer-events-none absolute"
          style={{
            left: canvasOffset.left,
            top: canvasOffset.top,
            width: canvasWidth || 1,
            height: canvasHeight || 1,
            overflow: 'visible',
          }}
        >
          <line
            x1={polygonPoints[polygonPoints.length - 1][0]}
            y1={polygonPoints[polygonPoints.length - 1][1]}
            x2={polygonMousePos.x}
            y2={polygonMousePos.y}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          <circle
            cx={polygonMousePos.x}
            cy={polygonMousePos.y}
            r={4}
            fill="rgba(255,255,255,0.8)"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={1}
          />
          {polygonPoints.length >= 3 && (
            <>
              <line
                x1={polygonMousePos.x}
                y1={polygonMousePos.y}
                x2={polygonPoints[0][0]}
                y2={polygonPoints[0][1]}
                stroke="rgba(0,220,220,0.35)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <circle
                cx={polygonPoints[0][0]}
                cy={polygonPoints[0][1]}
                r={6}
                fill="none"
                stroke="rgba(0,220,220,0.7)"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            </>
          )}
        </svg>
      )}
      {freeSelectActive && !freeSelectClosed && freeSelectPoints.length > 0 && polygonMousePos && (() => {
        const snapThreshold = Math.max(20, Math.min(canvasWidth, canvasHeight) * 0.03)
        const dx = polygonMousePos.x - freeSelectPoints[0][0]
        const dy = polygonMousePos.y - freeSelectPoints[0][1]
        const dist = Math.sqrt(dx * dx + dy * dy)
        const near = dist <= snapThreshold
        return (
          <svg
            className="pointer-events-none absolute"
            style={{
              left: canvasOffset.left,
              top: canvasOffset.top,
              width: canvasWidth || 1,
              height: canvasHeight || 1,
              overflow: 'visible',
            }}
          >
            <line
              x1={freeSelectPoints[freeSelectPoints.length - 1][0]}
              y1={freeSelectPoints[freeSelectPoints.length - 1][1]}
              x2={near ? freeSelectPoints[0][0] : polygonMousePos.x}
              y2={near ? freeSelectPoints[0][1] : polygonMousePos.y}
              stroke={near ? 'rgba(50,255,150,0.8)' : 'rgba(255,200,50,0.6)'}
              strokeWidth={near ? 2.5 : 1.5}
              strokeDasharray="4 4"
            />
            <circle
              cx={freeSelectPoints[0][0]}
              cy={freeSelectPoints[0][1]}
              r={near ? snapThreshold : 6}
              fill={near ? 'rgba(50,255,150,0.15)' : 'none'}
              stroke={near ? 'rgba(50,255,150,0.7)' : 'rgba(255,200,50,0.7)'}
              strokeWidth={near ? 2 : 2}
              className={near ? 'animate-pulse' : ''}
            />
            <circle
              cx={freeSelectPoints[0][0]}
              cy={freeSelectPoints[0][1]}
              r={4}
              fill={near ? '#32ff96' : 'rgba(255,200,50,0.8)'}
              stroke={near ? 'rgba(0,200,100,0.8)' : 'rgba(0,0,0,0.4)'}
              strokeWidth={1}
            />
            <text
              x={freeSelectPoints[0][0] - 4}
              y={freeSelectPoints[0][1] - snapThreshold - 6}
              fill={near ? '#32ff96' : 'rgba(255,200,50,0.6)'}
              fontSize={10}
              fontWeight={600}
              fontFamily="monospace"
              textAnchor="end"
            >
              {near ? 'Release to close' : ''}
            </text>
          </svg>
        )
      })()}
      {!hasImage && (
        <div className="flex flex-col items-center gap-3">
          <svg className="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
            <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-muted text-sm font-medium">Drop an image here or</p>
          <button
            onClick={onUploadClick}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            Choose Image
          </button>
        </div>
      )}
      {!cropActive && brushMode && cursorPos && hasImage && (
        brushShape === 'circle' ? (
          <div
            className={`pointer-events-none absolute border-[3px] ${colors.border} bg-white/10 shadow-lg rounded-full`}
            style={{
              width: brushSize,
              height: brushSize,
              left: cursorPos.x - brushSize / 2,
              top: cursorPos.y - brushSize / 2,
            }}
          >
            <div className={`absolute inset-[3px] rounded-full ${colors.inner}`} />
            <div className="absolute inset-0 border border-white/40 rounded-full" />
          </div>
        ) : (
          <div
            className="pointer-events-none absolute"
            style={{
              width: brushSize,
              height: brushSize,
              left: cursorPos.x - brushSize / 2,
              top: cursorPos.y - brushSize / 2,
            }}
          >
            <div className={`absolute inset-0 rounded-full border-2 border-dashed ${colors.border}`} />
            <div
              className={`absolute rounded-full border-2 ${colors.border} bg-white/30 shadow-sm`}
              style={{ width: 8, height: 8, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
        )
      )}
    </div>
  )
}
