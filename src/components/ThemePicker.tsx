import { useState, useRef, useEffect } from 'react'
import type { Theme } from '../hooks/useTheme'

interface ThemePickerProps {
  theme: Theme
  onChange: (t: Theme) => void
}

const THEMES: { id: Theme; label: string; dot: string }[] = [
  { id: 'light', label: 'Light', dot: '#f7f5f4' },
  { id: 'dark', label: 'Dark', dot: '#1e293b' },
  { id: 'pixelated', label: 'Pixelated', dot: '#00d4ff' },
  { id: 'gradient', label: 'Gradient', dot: '#667eea' },
  { id: 'texture', label: 'Texture', dot: '#8b7355' },
]

export default function ThemePicker({ theme, onChange }: ThemePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  const current = THEMES.find((t) => t.id === theme)!

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 md:py-1.5 py-2.5 text-xs font-medium text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200 btn-min-touch"
        title="Switch theme"
      >
        <span
          className="w-3 h-3 rounded-full border border-white/30 shrink-0"
          style={{ backgroundColor: current.dot }}
        />
        <span>{current.label}</span>
        <svg className={`w-3 h-3 ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-40 bg-card border border-divider rounded-xl shadow-xl z-50 py-1 transition-colors">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => { onChange(t.id); setOpen(false) }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left transition-colors ${
                theme === t.id
                  ? 'bg-surface text-accent font-semibold'
                  : 'text-muted hover:bg-surface hover:text-accent'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-divider shrink-0"
                style={{ backgroundColor: t.dot }}
              />
              {t.label}
              {theme === t.id && (
                <svg className="w-3.5 h-3.5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
