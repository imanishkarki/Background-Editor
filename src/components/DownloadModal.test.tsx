import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DownloadModal from './DownloadModal'

describe('DownloadModal', () => {
  beforeEach(() => {
    // Fake timing for focus trap tests
    vi.useFakeTimers()
  })

  it('renders nothing when closed', () => {
    render(<DownloadModal open={false} defaultName="test.png" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByText('Download Image')).not.toBeInTheDocument()
  })

  it('renders dialog when open', () => {
    render(<DownloadModal open={true} defaultName="test.png" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Download Image')).toBeInTheDocument()
  })

  it('shows the default name in the input', () => {
    render(<DownloadModal open={true} defaultName="my-image.png" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    const input = screen.getByLabelText('File name') as HTMLInputElement
    expect(input.value).toBe('my-image.png')
  })

  it('calls onConfirm with name on submit', () => {
    const onConfirm = vi.fn()
    render(<DownloadModal open={true} defaultName="output" onConfirm={onConfirm} onCancel={vi.fn()} />)
    const input = screen.getByLabelText('File name')
    fireEvent.change(input, { target: { value: 'result.png' } })
    fireEvent.click(screen.getByText('Download'))
    expect(onConfirm).toHaveBeenCalledWith('result.png')
  })

  it('appends .png if name does not end with .png', () => {
    const onConfirm = vi.fn()
    render(<DownloadModal open={true} defaultName="image" onConfirm={onConfirm} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Download'))
    expect(onConfirm).toHaveBeenCalledWith('image.png')
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<DownloadModal open={true} defaultName="test.png" onConfirm={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onCancel on Escape key', () => {
    const onCancel = vi.fn()
    render(<DownloadModal open={true} defaultName="test.png" onConfirm={vi.fn()} onCancel={onCancel} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })

  it('has role="dialog" and aria-modal="true"', () => {
    render(<DownloadModal open={true} defaultName="test.png" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})
