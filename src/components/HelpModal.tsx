import { useEffect, useRef } from 'react'

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-sm font-bold text-accent mb-3 uppercase tracking-wider">
      {children}
    </h3>
  )
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="px-2 py-0.5 rounded border border-divider bg-surface text-xs font-mono text-accent shadow-sm">
      {children}
    </kbd>
  )
}

function ShortcutRow({ label, keys }: { label: string; keys: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm text-accent">
      <span>{label}</span>
      <span className="space-x-1">{keys}</span>
    </div>
  )
}

function ShortcutKey({ k }: { k: string }) {
  return <Kbd>{k}</Kbd>
}

function ShortcutPlus() {
  return <span className="text-muted">+</span>
}

export default function HelpModal({ open, onClose }: HelpModalProps) {
  const titleId = 'help-modal-title'
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.focus()

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
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
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-lg bg-card rounded-xl border border-divider shadow-xl transition-colors max-h-[80vh] flex flex-col outline-none"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider">
          <h2 id={titleId} className="text-base font-bold text-accent">Help &amp; About</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-surface text-muted hover:text-accent transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          {/* Section 1: Keyboard Shortcuts */}
          <section>
            <SectionTitle>Keyboard Shortcuts</SectionTitle>
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">File</p>
              <ShortcutRow label="Open image" keys={<><ShortcutKey k="Ctrl" /><ShortcutPlus /><ShortcutKey k="O" /></>} />
              <ShortcutRow label="Download result" keys={<><ShortcutKey k="Ctrl" /><ShortcutPlus /><ShortcutKey k="S" /></>} />

              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted pt-1">Edit</p>
              <ShortcutRow label="Undo" keys={<><ShortcutKey k="Ctrl" /><ShortcutPlus /><ShortcutKey k="Z" /></>} />
              <ShortcutRow label="Redo" keys={<><ShortcutKey k="Ctrl" /><ShortcutPlus /><ShortcutKey k="Shift" /><ShortcutPlus /><ShortcutKey k="Z" /> <span className="text-muted">or</span> <ShortcutKey k="Ctrl" /><ShortcutPlus /><ShortcutKey k="Y" /></>} />

              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted pt-1">Tools</p>
              <ShortcutRow label="Color Eraser" keys={<><ShortcutKey k="1" /></>} />
              <ShortcutRow label="Restore Brush" keys={<><ShortcutKey k="2" /></>} />
              <ShortcutRow label="Magic Wand" keys={<><ShortcutKey k="3" /></>} />
              <ShortcutRow label="Polygon Select" keys={<><ShortcutKey k="4" /></>} />
              <ShortcutRow label="Free Select" keys={<><ShortcutKey k="5" /></>} />

              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted pt-1">Brush</p>
              <ShortcutRow label="Decrease brush size" keys={<><ShortcutKey k="[" /></>} />
              <ShortcutRow label="Increase brush size" keys={<><ShortcutKey k="]" /></>} />

              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted pt-1">Selection</p>
              <ShortcutRow label="Apply selection" keys={<><ShortcutKey k="Delete" /> <span className="text-muted">/</span> <ShortcutKey k="Enter" /></>} />
              <ShortcutRow label="Cancel selection" keys={<><ShortcutKey k="Esc" /></>} />
            </div>
          </section>

          {/* Section 2: About */}
          <section>
            <SectionTitle>About</SectionTitle>
            <p className="text-sm text-muted leading-relaxed">
              <strong className="text-accent">Attibabal Tool</strong> lets you
              remove image backgrounds entirely in your browser. No data is uploaded to any
              server — all processing happens locally using the Canvas API.
            </p>
            <ul className="mt-2 text-sm text-muted space-y-1 list-disc list-inside">
              <li>Click on a color to sample it, then remove it instantly</li>
              <li>Use the <strong className="text-accent">Color Eraser</strong> brush to erase similar colors</li>
              <li>Use the <strong className="text-accent">Restore Original</strong> brush to paint back the original</li>
              <li>Use the <strong className="text-accent">Magic Wand</strong> to select contiguous areas</li>
              <li>Download the result as a transparent PNG</li>
            </ul>
          </section>

          {/* Section 3: Session & Cache */}
          <section>
            <SectionTitle>Session &amp; Cache</SectionTitle>
            <p className="text-sm text-muted leading-relaxed">
              Your current work is automatically saved in your browser's local cache.
              When you close or refresh the page, your session will be restored
              automatically the next time you visit.
            </p>
            <ul className="mt-2 text-sm text-muted space-y-1 list-disc list-inside">
              <li>To start fresh, click <strong className="text-accent">Clear Cache</strong> in the Actions panel</li>
              <li>Use <Kbd>Ctrl</Kbd><ShortcutPlus /><Kbd>Z</Kbd> to undo changes</li>
            </ul>
          </section>

        </div>

        <div className="px-5 py-3 border-t border-divider flex items-center justify-between">
          <p className="text-xs text-muted">Built with care by @Manish</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface text-sm font-medium text-accent hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
