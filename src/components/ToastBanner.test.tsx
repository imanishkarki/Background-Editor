import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ToastBanner from './ToastBanner'

describe('ToastBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing when message is null', () => {
    const { container } = render(<ToastBanner message={null} onDismiss={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the error message', () => {
    render(<ToastBanner message="Something went wrong" onDismiss={vi.fn()} variant="error" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders the info message', () => {
    render(<ToastBanner message="Session restored" onDismiss={vi.fn()} variant="info" />)
    expect(screen.getByText('Session restored')).toBeInTheDocument()
  })

  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn()
    render(<ToastBanner message="Dismiss me" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('auto-dismisses after 4 seconds', () => {
    const onDismiss = vi.fn()
    render(<ToastBanner message="Auto dismiss" onDismiss={onDismiss} />)
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(4000) })
    expect(onDismiss).toHaveBeenCalled()
  })

  it('does not auto-dismiss if message changes to null', () => {
    const onDismiss = vi.fn()
    const { rerender } = render(<ToastBanner message="Hello" onDismiss={onDismiss} />)
    rerender(<ToastBanner message={null} onDismiss={onDismiss} />)
    act(() => { vi.advanceTimersByTime(4000) })
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
