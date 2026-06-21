import type { BrushType, BrushShape, SelectedColor } from '../types/image'
import ToolButton from './ToolButton'

function UploadIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg> }
function XIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg> }
function WandIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l-4 4" /></svg> }
function EraserIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 20h18M6 18l10-10 4 4-10 10z" /></svg> }
function RestoreIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 4L9 15m0 0l-3 3 2 2 3-3m-2-2l6-6" /></svg> }
function CropIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6V4h2m-2 14v2h2m12-16h2v2m0 12v2h-2M4 12h16" /></svg> }
function ResetIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> }
function DownloadIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> }
function CheckIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg> }
function PolyIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M6 6l4 8 4-4 4 8 4-8" /></svg> }
function LassoIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 14.5A7.5 7.5 0 1119.5 11c0 2.5-1.3 4.7-3.3 6.1A5.5 5.5 0 0112 19.5a4.5 4.5 0 01-3-.8" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 10a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" d="M9 18a2 2 0 11-4 0 2 2 0 014 0z" /></svg> }
function UndoIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg> }
function RedoIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></svg> }

interface SidebarProps {
  onUpload: (file: File) => void
  hasImage: boolean

  brushMode: boolean
  brushType: BrushType
  magicWandMode: boolean
  cropActive: boolean
  hasSelectedColor: boolean
  onRemoveColor: () => void
  onMagicWand: () => void
  onCropTool: () => void
  onActivateBrush: (type: BrushType) => void

  tolerance: number
  onToleranceChange: (v: number) => void
  removalStrength: number
  onRemovalStrengthChange: (v: number) => void
  brushSize: number
  onBrushSizeChange: (v: number) => void
  brushOpacity: number
  onBrushOpacityChange: (v: number) => void
  brushShape: BrushShape
  onBrushShapeChange: (v: BrushShape) => void
  imageOpacity: number
  onImageOpacityChange: (v: number) => void
  selectedColor: SelectedColor | null

  selectionActive: boolean
  onConfirmSelection: () => void
  onCancelSelection: () => void

  cropRect: { x: number; y: number; w: number; h: number } | null
  onCropConfirm: () => void
  onCropCancel: () => void

  onReset: () => void
  onDownload: () => void
  onRemoveImage: () => void
  onClearCache: () => void
  onUndo: () => void
  onRedo: () => void

  polygonActive: boolean
  polygonPoints: [number, number][]
  polygonClosed: boolean
  onPolygonTool: () => void
  onClearPolygon: () => void

  freeSelectActive: boolean
  freeSelectPoints: [number, number][]
  freeSelectClosed: boolean
  onFreeSelectTool: () => void
  onClearFreehand: () => void
}

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-3">
      {children}
    </p>
  )
}

function PropertySlider({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  disabled,
  color,
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  unit?: string
  disabled?: boolean
  color?: string
  hint?: string
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-muted">{label}</label>
        <span className="text-xs font-mono text-accent font-semibold">
          {value}{unit ?? ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`w-full md:h-1.5 h-2.5 bg-surface border border-divider rounded-full appearance-none cursor-pointer ${color ?? 'accent-orange-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      <div className="flex justify-between text-[10px] text-muted mt-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {hint && <p className="text-[10px] text-muted mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  )
}

export default function Sidebar({
  onUpload,
  hasImage,
  brushMode,
  brushType,
  magicWandMode,
  cropActive,
  hasSelectedColor,
  onRemoveColor,
  onMagicWand,
  onCropTool,
  onActivateBrush,
  tolerance,
  onToleranceChange,
  removalStrength,
  onRemovalStrengthChange,
  brushSize,
  onBrushSizeChange,
  brushOpacity,
  onBrushOpacityChange,
  brushShape,
  onBrushShapeChange,
  imageOpacity,
  onImageOpacityChange,
  selectedColor,
  selectionActive,
  onConfirmSelection,
  onCancelSelection,
  cropRect,
  onCropConfirm,
  onCropCancel,
  onReset,
  onDownload,
  onRemoveImage,
  onClearCache,
  onUndo,
  onRedo,
  polygonActive,
  polygonPoints,
  polygonClosed,
  onPolygonTool,
  onClearPolygon,
  freeSelectActive,
  freeSelectPoints,
  freeSelectClosed,
  onFreeSelectTool,
  onClearFreehand,
}: SidebarProps) {
  const eraseActive = brushMode && brushType === 'erase'
  const restoreActive = brushMode && brushType === 'restore'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    if (e.target) e.target.value = ''
  }

  return (
    <div className="w-64 bg-card border-r border-divider flex flex-col h-full overflow-y-auto shrink-0 transition-colors">
      {/* Upload */}
      <div className="p-4 border-b border-divider">
        <SectionTitle>Upload</SectionTitle>
        <label className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-200 cursor-pointer">
          <UploadIcon />
          <span>Choose Image</span>
          <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      {hasImage && (
        <>
          {/* Tools */}
          <div className="p-4 border-b border-divider">
            <SectionTitle>Tools</SectionTitle>
            <div className="space-y-1">
              <ToolButton
                icon={<XIcon />}
                label="Remove Color"
                variant="red"
                disabled={!hasSelectedColor}
                onClick={onRemoveColor}
              />
            </div>
          </div>
          <div className="mb-3">
            <ToolButton
              icon={<WandIcon />}
              label="Magic Wand"
              variant="purple"
              active={magicWandMode}
              onClick={onMagicWand}
            />
            <ToolButton
                icon={<EraserIcon />}
                label="Color Eraser"
                variant="orange"
                active={eraseActive}
                disabled={!hasSelectedColor}
                onClick={() => onActivateBrush('erase')}
              />
              <ToolButton
                icon={<RestoreIcon />}
                label="Restore Original"
                variant="blue"
                active={restoreActive}
                onClick={() => onActivateBrush('restore')}
              />
              <ToolButton
                icon={<CropIcon />}
                label="Crop"
                variant="emerald"
                active={cropActive}
                onClick={onCropTool}
              />
              <ToolButton
                icon={<PolyIcon />}
                label="Polygon Select"
                variant="teal"
                active={polygonActive}
                onClick={onPolygonTool}
              />
              <ToolButton
                icon={<LassoIcon />}
                label="Free Select"
                variant="amber"
                active={freeSelectActive}
                onClick={onFreeSelectTool}
              />
            </div>

          {(polygonClosed || polygonPoints.length > 0 || freeSelectClosed || freeSelectPoints.length > 0) && (
            <div className="p-4 border-b border-divider">
              <SectionTitle>Selection Area</SectionTitle>
              <div className="space-y-2">
                <p className="text-xs text-muted">
                  {polygonActive && !polygonClosed
                    ? 'Click canvas to place points. Click first point or double-click to close.'
                    : freeSelectActive && !freeSelectClosed
                      ? 'Drag on the canvas to draw a freehand shape. Release near start to close.'
                      : polygonClosed && !selectedColor
                        ? 'Click inside the polygon to pick a color.'
                        : freeSelectClosed && !selectedColor
                          ? 'Click inside the selection to pick a color.'
                          : (polygonClosed || freeSelectClosed) && selectedColor
                            ? 'Color selected. Use Remove Color to remove it within the selection area.'
                            : ''}
                </p>
                {(polygonClosed || freeSelectClosed) && selectedColor && (
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300 shrink-0"
                      style={{ backgroundColor: `rgb(${selectedColor.r},${selectedColor.g},${selectedColor.b})` }}
                    />
                    <span className="text-xs text-muted font-mono">
                      rgb({selectedColor.r},{selectedColor.g},{selectedColor.b})
                    </span>
                  </div>
                )}
                {polygonClosed && (
                  <button
                    onClick={onClearPolygon}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-accent hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98] transition-all duration-200"
                  >
                    <XIcon />
                    Clear Polygon
                  </button>
                )}
                {freeSelectClosed && (
                  <button
                    onClick={onClearFreehand}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-accent hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98] transition-all duration-200"
                  >
                    <XIcon />
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Properties */}
          <div className="p-4 border-b border-divider">
            <SectionTitle>Properties</SectionTitle>
            <PropertySlider
              label="Tolerance"
              value={tolerance}
              onChange={onToleranceChange}
              min={0}
              max={100}
              disabled={!hasImage}
              hint="Higher tolerance removes a wider range of similar colors"
            />

            <PropertySlider
              label="Removal Strength"
              value={removalStrength}
              onChange={onRemovalStrengthChange}
              min={0}
              max={100}
              unit="%"
              color="accent-violet-500"
              disabled={!hasImage}
              hint="Controls how transparent removed pixels become"
            />

            <PropertySlider
              label="Image Opacity"
              value={imageOpacity}
              onChange={onImageOpacityChange}
              min={0}
              max={100}
              unit="%"
              color="accent-teal-500"
            />

            {brushMode && (
              <>
                <PropertySlider
                  label="Brush Size"
                  value={brushSize}
                  onChange={onBrushSizeChange}
                  min={5}
                  max={200}
                  unit="px"
                  color={brushType === 'erase' ? 'accent-orange-500' : 'accent-blue-500'}
                />
                <PropertySlider
                  label="Brush Opacity"
                  value={brushOpacity}
                  onChange={onBrushOpacityChange}
                  min={0}
                  max={100}
                  unit="%"
                  color="accent-purple-500"
                />
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted mb-2 block">Brush Shape</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['circle', 'square', 'diamond', 'round', 'flat', 'dry', 'splatter', 'fan'] as BrushShape[]).map((shape) => (
                      <button
                        key={shape}
                        onClick={() => onBrushShapeChange(shape)}
                        className={`flex items-center justify-center w-full aspect-square rounded-lg border-2 transition-all ${
                          brushShape === shape
                            ? 'border-accent bg-accent/10 shadow-sm'
                            : 'border-divider text-muted hover:border-accent/50 hover:text-accent'
                        }`}
                        title={shape.charAt(0).toUpperCase() + shape.slice(1)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          {shape === 'circle' && <circle cx="12" cy="12" r="7" />}
                          {shape === 'square' && <rect x="5" y="5" width="14" height="14" rx="2" />}
                          {shape === 'diamond' && <polygon points="12,4 20,12 12,20 4,12" />}
                          {shape === 'round' && <ellipse cx="12" cy="12" rx="8" ry="5" />}
                          {shape === 'flat' && <rect x="3" y="9" width="18" height="6" rx="2" />}
                          {shape === 'dry' && <path d="M8 7c-3 2-4 5-2 8 2 3 6 4 9 3s4-5 3-8-5-5-8-4zM7 16l-2 2" />}
                          {shape === 'splatter' && <><circle cx="8" cy="8" r="2.5" /><circle cx="16" cy="10" r="2" /><circle cx="11" cy="16" r="3" /><circle cx="18" cy="17" r="1.5" /></>}
                          {shape === 'fan' && <path d="M12 17c-4 0-7-3-7-7h14c0 4-3 7-7 7z" />}
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-2">Color</p>
              {selectedColor ? (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg border-2 border-divider shadow-sm shrink-0"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <div className="text-xs">
                    <p className="text-accent font-semibold font-mono">{selectedColor.hex}</p>
                    <p className="text-muted font-mono">
                      {selectedColor.rgb.r}, {selectedColor.rgb.g}, {selectedColor.rgb.b}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted">Click image to select</p>
              )}
            </div>
          </div>

          {/* Selection Actions */}
          {selectionActive && (
            <div className="p-4 border-b border-divider">
              <SectionTitle>Selection</SectionTitle>
              <div className="space-y-2">
                <button
                  onClick={onConfirmSelection}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-emerald-600 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all duration-200"
                >
                  <CheckIcon />
                  Apply Selection
                </button>
                <button
                  onClick={onCancelSelection}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-accent hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98] transition-all duration-200"
                >
                  <XIcon />
                  Cancel
                </button>
                <p className="text-[10px] text-muted text-center">
                  Del to apply &middot; Esc to cancel
                </p>
              </div>
            </div>
          )}

          {/* Crop Actions */}
          {cropActive && cropRect && cropRect.w > 0 && cropRect.h > 0 && (
            <div className="p-4 border-b border-divider">
              <SectionTitle>Crop</SectionTitle>
              <div className="space-y-2">
                <button
                  onClick={onCropConfirm}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-emerald-600 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all duration-200"
                >
                  <CheckIcon />
                  Apply Crop
                </button>
                <button
                  onClick={onCropCancel}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-accent hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98] transition-all duration-200"
                >
                  <XIcon />
                  Cancel
                </button>
                <p className="text-[10px] text-muted text-center">
                  Enter to apply &middot; Esc to cancel
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 mt-auto border-t border-divider">
            <SectionTitle>Actions</SectionTitle>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={onUndo}
                  className="flex items-center justify-center gap-2 flex-1 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-accent hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98] transition-all duration-200"
                  title="Undo (Ctrl+Z)"
                >
                  <UndoIcon />
                  Undo
                </button>
                <button
                  onClick={onRedo}
                  className="flex items-center justify-center gap-2 flex-1 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-accent hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98] transition-all duration-200"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <RedoIcon />
                  Redo
                </button>
              </div>
              <button
                onClick={onReset}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-accent hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ResetIcon />
                Reset
              </button>
              <button
                onClick={onRemoveImage}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 active:scale-[0.98] transition-all duration-200"
              >
                <XIcon />
                Remove Image
              </button>
              <button
                onClick={onDownload}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-emerald-600 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <DownloadIcon />
                Download PNG
              </button>
              <button
                onClick={onClearCache}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-muted hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-[0.98] transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Clear Cache
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
