import { useEffect } from 'react'

interface ToastBannerProps {
  message: string | null
  onDismiss: () => void
  variant?: 'error' | 'info'
}

export default function ToastBanner({ message, onDismiss, variant = 'error' }: ToastBannerProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  if (!message) return null

  const isError = variant === 'error'

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm backdrop-blur-sm transition-colors ${
        isError
          ? 'border-red-200 bg-red-50/90 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400'
          : 'border-blue-200 bg-blue-50/90 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      }`}
    >
      <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        {isError ? (
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        )}
      </svg>
      <span className="flex-1 font-medium">{message}</span>
      <button
        onClick={onDismiss}
        className={`shrink-0 rounded-lg p-1 transition-colors ${
          isError
            ? 'hover:bg-red-100 dark:hover:bg-red-800/50'
            : 'hover:bg-blue-100 dark:hover:bg-blue-800/50'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
