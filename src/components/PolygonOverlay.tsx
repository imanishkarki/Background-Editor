import { useEffect, useRef } from 'react'
import { safeGetContext } from '../utils/helpers'

interface PolygonOverlayProps {
  points: [number, number][]
  closed: boolean
  canvasWidth: number
  canvasHeight: number
  offsetLeft: number
  offsetTop: number
}

export default function PolygonOverlay({
  points,
  closed,
  canvasWidth,
  canvasHeight,
  offsetLeft,
  offsetTop,
}: PolygonOverlayProps) {
  const overlayRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = overlayRef.current
    if (!canvas) return

    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = safeGetContext(canvas)
    if (!ctx) return
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    if (points.length < 1) return

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.lineDashOffset = 0
    ctx.beginPath()
    ctx.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1])
    }
    if (closed && points.length > 2) {
      ctx.lineTo(points[0][0], points[0][1])
    }
    ctx.stroke()

    ctx.setLineDash([])

    for (let i = 0; i < points.length; i++) {
      ctx.beginPath()
      ctx.arc(points[i][0], points[i][1], 4, 0, Math.PI * 2)
      ctx.fillStyle = i === 0 ? 'rgba(0, 200, 200, 0.9)' : 'rgba(255, 255, 255, 0.9)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    if (closed && points.length > 2) {
      ctx.fillStyle = 'rgba(0, 200, 200, 0.08)'
      ctx.beginPath()
      ctx.moveTo(points[0][0], points[0][1])
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1])
      }
      ctx.closePath()
      ctx.fill()
    }
  }, [points, closed, canvasWidth, canvasHeight])

  if (points.length < 1) return null

  return (
    <canvas
      ref={overlayRef}
      className="pointer-events-none absolute rounded-lg"
      width={canvasWidth}
      height={canvasHeight}
      style={{ left: offsetLeft, top: offsetTop, imageRendering: 'pixelated' }}
    />
  )
}
