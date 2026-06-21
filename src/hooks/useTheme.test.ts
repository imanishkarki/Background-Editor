import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

const STORAGE_KEY = 'color-bg-remover-theme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('defaults to light theme', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('persists theme to localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('dark'))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
  })

  it('loads persisted theme from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'pixelated')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('pixelated')
  })

  it('adds CSS classes to document for dark theme', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('dark'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes old CSS classes when switching themes', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('dark'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => result.current.setTheme('light'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('adds multiple classes for pixelated theme', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('pixelated'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('theme-pixelated')).toBe(true)
  })

  it('handles texture theme class', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('texture'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.classList.contains('theme-texture')).toBe(true)
  })

  it('handles localStorage error gracefully', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('gradient'))
    expect(result.current.theme).toBe('gradient')
    setItem.mockRestore()
  })

  it('falls back to light on invalid stored theme', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid_theme')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it.each(['light', 'dark', 'pixelated', 'gradient', 'texture'] as const)('supports %s theme', (themeName) => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme(themeName))
    expect(result.current.theme).toBe(themeName)
  })

  it('removes all theme classes when switching to light', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('pixelated'))
    act(() => result.current.setTheme('light'))
    expect(document.documentElement.classList.length).toBe(0)
  })
})
