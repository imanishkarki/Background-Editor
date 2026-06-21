import { useEffect, useRef } from 'react'
import { safeGetContext } from '../utils/helpers'

interface SelectionOverlayProps {
  contour: [number, number][]
  canvasWidth: number
  canvasHeight: number
  isActive: boolean
  offsetLeft: number
  offsetTop: number
}

export default function SelectionOverlay({
  contour,
  canvasWidth,
  canvasHeight,
  isActive,
  offsetLeft,
  offsetTop,
}: SelectionOverlayProps) {
  const overlayRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!isActive || !contour.length || !overlayRef.current) return

    const canvas = overlayRef.current
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = safeGetContext(canvas)
    if (!ctx) return
    let offset = 0
    let rafId = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      const intOffset = Math.floor(offset)
      for (let i = 0; i < contour.length; i++) {
        const phase = (intOffset + i) % 8
        const [x, y] = contour[i]
        if (phase < 4) {
          ctx.fillStyle = 'white'
          ctx.fillRect(x, y, 1, 1)
        }
      }
      for (let i = 0; i < contour.length; i++) {
        const phase = (intOffset + i) % 8
        const [x, y] = contour[i]
        if (phase >= 4) {
          ctx.fillStyle = 'black'
          ctx.fillRect(x, y, 1, 1)
        }
      }

      offset = (offset + 0.4) % 8
      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [contour, canvasWidth, canvasHeight, isActive])

  if (!isActive || !contour.length) return null

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
