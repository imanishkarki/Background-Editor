import { useCallback, useRef } from 'react'

const MAX_HISTORY = 10

function cloneImageData(data: ImageData): ImageData {
  return new ImageData(
    new Uint8ClampedArray(data.data),
    data.width,
    data.height
  )
}

export function useHistory() {
  const pastRef = useRef<ImageData[]>([])
  const futureRef = useRef<ImageData[]>([])

  const pushState = useCallback((imageData: ImageData) => {
    const past = pastRef.current
    past.push(cloneImageData(imageData))
    if (past.length > MAX_HISTORY) past.shift()
    futureRef.current = []
  }, [])

  const undo = useCallback((currentData: ImageData): ImageData | null => {
    const past = pastRef.current
    if (past.length === 0) return null
    const previous = past.pop()!
    futureRef.current.unshift(cloneImageData(currentData))
    return previous
  }, [])

  const redo = useCallback((currentData: ImageData): ImageData | null => {
    const future = futureRef.current
    if (future.length === 0) return null
    const next = future.shift()!
    pastRef.current.push(cloneImageData(currentData))
    return next
  }, [])

  return { pushState, undo, redo }
}
