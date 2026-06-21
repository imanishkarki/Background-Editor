import type { ReactNode } from 'react'

type ToolVariant = 'red' | 'violet' | 'orange' | 'blue' | 'gray' | 'emerald' | 'teal' | 'amber'

interface ToolButtonProps {
  icon: ReactNode
  label: string
  active?: boolean
  disabled?: boolean
  variant?: ToolVariant
  onClick: () => void
}

const VARIANT_STYLES: Record<ToolVariant, { ring: string; activeBg: string; hoverBg: string }> = {
  red:    { ring: 'ring-red-300', activeBg: 'bg-red-50 dark:bg-red-950', hoverBg: 'hover:bg-red-500/10' },
  violet: { ring: 'ring-violet-300', activeBg: 'bg-violet-50 dark:bg-violet-950', hoverBg: 'hover:bg-violet-500/10' },
  orange: { ring: 'ring-orange-300', activeBg: 'bg-orange-50 dark:bg-orange-950', hoverBg: 'hover:bg-orange-500/10' },
  blue:   { ring: 'ring-blue-300', activeBg: 'bg-blue-50 dark:bg-blue-950', hoverBg: 'hover:bg-blue-500/10' },
  gray:   { ring: 'ring-gray-300', activeBg: 'bg-gray-50 dark:bg-gray-800', hoverBg: 'hover:bg-gray-500/10' },
  emerald:{ ring: 'ring-emerald-300', activeBg: 'bg-emerald-50 dark:bg-emerald-950', hoverBg: 'hover:bg-emerald-500/10' },
  teal:   { ring: 'ring-teal-300', activeBg: 'bg-teal-50 dark:bg-teal-950', hoverBg: 'hover:bg-teal-500/10' },
  amber:  { ring: 'ring-amber-300', activeBg: 'bg-amber-50 dark:bg-amber-950', hoverBg: 'hover:bg-amber-500/10' },
}

export default function ToolButton({
  icon,
  label,
  active = false,
  disabled = false,
  variant = 'gray',
  onClick,
}: ToolButtonProps) {
  const s = VARIANT_STYLES[variant]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? `${s.activeBg} text-accent ring-1 ${s.ring} shadow-sm`
          : 'text-muted hover:text-accent hover:bg-surface/80'
      } ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <span className="w-5 h-5 shrink-0 flex items-center justify-center">
        {icon}
      </span>
      <span>{label}</span>
      {active && <span className="ml-auto w-2 h-2 rounded-full bg-current opacity-60" />}
    </button>
  )
}
