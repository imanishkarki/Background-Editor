import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ToolButton from './ToolButton'

function makeIcon() {
  return <span data-testid="test-icon">★</span>
}

describe('ToolButton', () => {
  it('renders label and icon', () => {
    render(<ToolButton icon={makeIcon()} label="Remove Color" onClick={vi.fn()} />)
    expect(screen.getByText('Remove Color')).toBeInTheDocument()
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ToolButton icon={makeIcon()} label="Click Me" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<ToolButton icon={makeIcon()} label="Disabled" onClick={onClick} disabled={true} />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows active indicator when active', () => {
    render(<ToolButton icon={makeIcon()} label="Active Tool" onClick={vi.fn()} active={true} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('ring')
  })

  it('does not show active indicator when inactive', () => {
    render(<ToolButton icon={makeIcon()} label="Inactive Tool" onClick={vi.fn()} active={false} />)
    const button = screen.getByRole('button')
    expect(button.className).not.toContain('ring-1')
  })
})
