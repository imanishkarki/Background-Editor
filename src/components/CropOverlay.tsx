import type { CropRect } from '../types/image'

interface CropOverlayProps {
  cropRect: CropRect | null
  canvasWidth: number
  canvasHeight: number
  offsetLeft: number
  offsetTop: number
  isActive: boolean
}

export default function CropOverlay({
  cropRect,
  _canvasWidth,
  _canvasHeight,
  offsetLeft,
  offsetTop,
  isActive,
}: CropOverlayProps) {
  if (!isActive || !cropRect || cropRect.w === 0 || cropRect.h === 0) return null

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: offsetLeft + cropRect.x,
        top: offsetTop + cropRect.y,
        width: cropRect.w,
        height: cropRect.h,
      }}
    >
      <div
        className="absolute inset-0 border-2 border-white"
        style={{
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
        }}
      />
      <div className="absolute -top-1 -left-1 w-3 h-3 border-2 border-white bg-surface rounded-sm" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-white bg-surface rounded-sm" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-2 border-white bg-surface rounded-sm" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white bg-surface rounded-sm" />
    </div>
  )
}
