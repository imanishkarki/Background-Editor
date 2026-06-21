import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ContextMenu from './ContextMenu'
import type { ContextMenuItem } from './ContextMenu'

function makeItems(count = 3): ContextMenuItem[] {
  return Array.from({ length: count }, (_, i) => ({
    label: `Item ${i + 1}`,
    icon: <span data-testid={`icon-${i}`}>I</span>,
    onClick: vi.fn(),
    ...(i === 0 ? { shortcut: 'Ctrl+Z' } : {}),
  }))
}

describe('ContextMenu', () => {
  it('renders nothing when closed', () => {
    render(<ContextMenu x={0} y={0} open={false} onClose={vi.fn()} items={makeItems()} />)
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
  })

  it('renders items when open', () => {
    render(<ContextMenu x={100} y={100} open={true} onClose={vi.fn()} items={makeItems()} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('calls onClick and onClose when item is clicked', () => {
    const onClose = vi.fn()
    const items = makeItems()
    render(<ContextMenu x={100} y={100} open={true} onClose={onClose} items={items} />)
    fireEvent.click(screen.getByText('Item 1'))
    expect(items[0].onClick).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClick for disabled items', () => {
    const items = makeItems()
    items[1].disabled = true
    render(<ContextMenu x={100} y={100} open={true} onClose={vi.fn()} items={items} />)
    fireEvent.click(screen.getByText('Item 2'))
    expect(items[1].onClick).not.toHaveBeenCalled()
  })

  it('shows empty state when no items', () => {
    render(<ContextMenu x={100} y={100} open={true} onClose={vi.fn()} items={[]} />)
    expect(screen.getByText('No actions available')).toBeInTheDocument()
  })

  it('closes on Escape key', () => {
    const onClose = vi.fn()
    render(<ContextMenu x={100} y={100} open={true} onClose={onClose} items={makeItems()} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('closes on outside click', () => {
    const onClose = vi.fn()
    render(<ContextMenu x={100} y={100} open={true} onClose={onClose} items={makeItems()} />)
    fireEvent.mouseDown(document.body)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows shortcut text when provided', () => {
    const items = makeItems()
    items[0].shortcut = 'Ctrl+Z'
    render(<ContextMenu x={100} y={100} open={true} onClose={vi.fn()} items={items} />)
    expect(screen.getByText('Ctrl+Z')).toBeInTheDocument()
  })

  it('has role="menu"', () => {
    render(<ContextMenu x={100} y={100} open={true} onClose={vi.fn()} items={makeItems()} />)
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('each item has role="menuitem"', () => {
    render(<ContextMenu x={100} y={100} open={true} onClose={vi.fn()} items={makeItems()} />)
    const items = screen.getAllByRole('menuitem')
    expect(items).toHaveLength(3)
  })

  it('Arrow Down moves focus to next item', () => {
    render(<ContextMenu x={100} y={100} open={true} onClose={vi.fn()} items={makeItems()} />)
    const firstItem = screen.getAllByRole('menuitem')[0]
    firstItem.focus()
    fireEvent.keyDown(firstItem, { key: 'ArrowDown' })
    expect(screen.getAllByRole('menuitem')[1]).toHaveFocus()
  })

  it('Arrow Up wraps to last item', () => {
    render(<ContextMenu x={100} y={100} open={true} onClose={vi.fn()} items={makeItems()} />)
    const firstItem = screen.getAllByRole('menuitem')[0]
    firstItem.focus()
    fireEvent.keyDown(firstItem, { key: 'ArrowUp' })
    expect(screen.getAllByRole('menuitem')[2]).toHaveFocus()
  })

  it('Home moves focus to first item', () => {
    render(<ContextMenu x={100} y={100} open={true} onClose={vi.fn()} items={makeItems()} />)
    const items = screen.getAllByRole('menuitem')
    items[2].focus()
    fireEvent.keyDown(items[2], { key: 'Home' })
    expect(items[0]).toHaveFocus()
  })

  it('End moves focus to last item', () => {
    render(<ContextMenu x={100} y={100} open={true} onClose={vi.fn()} items={makeItems()} />)
    const items = screen.getAllByRole('menuitem')
    items[0].focus()
    fireEvent.keyDown(items[0], { key: 'End' })
    expect(items[2]).toHaveFocus()
  })
})
