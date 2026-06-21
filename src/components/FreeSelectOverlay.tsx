import { useEffect, useRef } from 'react'
import { safeGetContext } from '../utils/helpers'

interface FreeSelectOverlayProps {
  points: [number, number][]
  closed: boolean
  canvasWidth: number
  canvasHeight: number
  offsetLeft: number
  offsetTop: number
}

function drawSmoothPath(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  closed: boolean,
  strokeStyle: string,
  lineWidth: number,
  fillStyle?: string
) {
  if (pts.length < 2) return

  ctx.beginPath()
  const n = pts.length

  if (closed && n > 2) {
    const mid: [number, number][] = []
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n
      mid.push([(pts[i][0] + pts[next][0]) / 2, (pts[i][1] + pts[next][1]) / 2])
    }
    ctx.moveTo(mid[0][0], mid[0][1])
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n
      ctx.quadraticCurveTo(pts[next][0], pts[next][1], mid[next][0], mid[next][1])
    }
    ctx.closePath()
  } else {
    ctx.moveTo(pts[0][0], pts[0][1])
    if (n === 2) {
      ctx.lineTo(pts[1][0], pts[1][1])
    } else {
      for (let i = 1; i < n - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2
        const my = (pts[i][1] + pts[i + 1][1]) / 2
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my)
      }
      ctx.lineTo(pts[n - 1][0], pts[n - 1][1])
    }
  }

  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth
  ctx.setLineDash([])
  ctx.stroke()

  if (fillStyle) {
    ctx.fillStyle = fillStyle
    ctx.fill()
  }
}

export default function FreeSelectOverlay({
  points,
  closed,
  canvasWidth,
  canvasHeight,
  offsetLeft,
  offsetTop,
}: FreeSelectOverlayProps) {
  const overlayRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = overlayRef.current
    if (!canvas) return

    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = safeGetContext(canvas)
    if (!ctx) return
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    if (points.length < 2) return

    drawSmoothPath(
      ctx, points, closed,
      'rgba(255, 200, 50, 0.85)',
      2,
      closed && points.length > 2 ? 'rgba(255, 200, 50, 0.06)' : undefined
    )
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
