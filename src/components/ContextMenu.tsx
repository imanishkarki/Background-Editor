import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react'

export interface ContextMenuItem {
  label: string
  icon: ReactNode
  onClick: () => void
  disabled?: boolean
  shortcut?: string
}

interface ContextMenuProps {
  x: number
  y: number
  open: boolean
  onClose: () => void
  items: ContextMenuItem[]
}

export default function ContextMenu({ x, y, open, onClose, items }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: x, top: y })

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler, { passive: true })
    window.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
      window.removeEventListener('keydown', keyHandler)
    }
  }, [open, onClose])

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (!items.length) return
    let nextIndex = index
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      nextIndex = (index + 1) % items.length
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      nextIndex = (index - 1 + items.length) % items.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIndex = items.length - 1
    } else {
      return
    }
    buttonRefs.current[nextIndex]?.focus()
  }, [items.length])

  useEffect(() => {
    if (!open) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({
      left: Math.min(x, window.innerWidth - rect.width - 8),
      top: Math.min(y, window.innerHeight - rect.height - 8),
    })
  }, [open, x, y])

  if (!open) return null

  buttonRefs.current = buttonRefs.current.slice(0, items.length)

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed z-[100] bg-card border border-divider rounded-xl shadow-xl py-1 min-w-[180px] transition-colors"
      style={{ left: pos.left, top: pos.top }}
    >
      {items.length === 0 && (
        <p className="px-4 py-2 text-xs text-muted">No actions available</p>
      )}
      {items.map((item, i) => (
        <button
          key={item.label}
          ref={(el) => { buttonRefs.current[i] = el }}
          role="menuitem"
          onClick={() => { if (!item.disabled) { item.onClick(); onClose() } }}
          onKeyDown={(e) => handleMenuKeyDown(e, i)}
          disabled={item.disabled}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left text-accent hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="w-4 h-4 shrink-0 flex items-center justify-center">{item.icon}</span>
          <span className="flex-1">{item.label}</span>
          {item.shortcut && (
            <span className="text-[10px] text-muted font-mono tracking-wide">{item.shortcut}</span>
          )}
        </button>
      ))}
    </div>
  )
}
