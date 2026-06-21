import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HelpModal from './HelpModal'

describe('HelpModal', () => {
  it('renders nothing when closed', () => {
    render(<HelpModal open={false} onClose={vi.fn()} />)
    expect(screen.queryByText('Help & About')).not.toBeInTheDocument()
  })

  it('renders content when open', () => {
    render(<HelpModal open={true} onClose={vi.fn()} />)
    expect(screen.getByText('Help & About')).toBeInTheDocument()
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('closes when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<HelpModal open={true} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('closes when clicking the close button', () => {
    const onClose = vi.fn()
    render(<HelpModal open={true} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('closes when clicking the footer Close button', () => {
    const onClose = vi.fn()
    render(<HelpModal open={true} onClose={onClose} />)
    const closeButtons = screen.getAllByText('Close')
    fireEvent.click(closeButtons[closeButtons.length - 1])
    expect(onClose).toHaveBeenCalled()
  })

  it('closes on backdrop click', () => {
    const onClose = vi.fn()
    const { container } = render(<HelpModal open={true} onClose={onClose} />)
    fireEvent.click(container.firstChild!)
    expect(onClose).toHaveBeenCalled()
  })

  it('has role="dialog" and aria-modal="true"', () => {
    render(<HelpModal open={true} onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('renders keyboard shortcut sections', () => {
    render(<HelpModal open={true} onClose={vi.fn()} />)
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('Brush')).toBeInTheDocument()
    expect(screen.getByText('Selection')).toBeInTheDocument()
  })
})
