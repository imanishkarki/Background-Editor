import { useEffect, useRef, useState } from 'react'

interface DownloadModalProps {
  open: boolean
  defaultName: string
  onConfirm: (name: string) => void
  onCancel: () => void
}

export default function DownloadModal({ open, defaultName, onConfirm, onCancel }: DownloadModalProps) {
  const [name, setName] = useState(defaultName)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = 'download-modal-title'

  useEffect(() => {
    if (!open) return
    setName(defaultName)
    inputRef.current?.focus()
    inputRef.current?.select()
    const prev = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onCancel(); return }
      if (e.key !== 'Tab' || !dialog) return
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      prev?.focus()
    }
  }, [open, defaultName, onCancel])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onConfirm(trimmed.endsWith('.png') ? trimmed : trimmed + '.png')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative bg-card border border-divider rounded-xl shadow-xl p-6 w-full max-w-80 mx-4"
      >
        <h2 id={titleId} className="text-sm font-bold text-accent uppercase tracking-wider mb-4">Download Image</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-xs font-medium text-muted mb-1.5" htmlFor="download-name">File name</label>
          <input
            ref={inputRef}
            id="download-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-divider bg-surface text-sm text-accent outline-none focus:ring-2 focus:ring-accent/40 transition-all"
            spellCheck={false}
          />
          <div className="flex items-center justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-accent hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all"
            >
              Download
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
