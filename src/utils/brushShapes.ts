import type { BrushShape } from '../types/image'

function hash2D(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  const n00 = hash2D(ix, iy)
  const n10 = hash2D(ix + 1, iy)
  const n01 = hash2D(ix, iy + 1)
  const n11 = hash2D(ix + 1, iy + 1)
  const nx0 = n00 + (n10 - n00) * sx
  const nx1 = n01 + (n11 - n01) * sx
  return nx0 + (nx1 - nx0) * sy
}

function fbm(x: number, y: number, octaves = 3): number {
  let value = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < octaves; i++) {
    value += amp * smoothNoise(x * freq, y * freq)
    amp *= 0.5
    freq *= 2
  }
  return value
}

const BRISTLE_PARTICLES: { nx: number; ny: number; size: number }[] = []
for (let i = 0; i < 50; i++) {
  const angle = hash2D(i * 7, i * 13) * Math.PI * 2
  const dist = 0.75 + hash2D(i * 3, i * 11) * 0.5
  BRISTLE_PARTICLES.push({
    nx: Math.cos(angle) * dist,
    ny: Math.sin(angle) * dist,
    size: 0.15 + hash2D(i * 5, i * 17) * 0.25,
  })
}

export function getBrushExtents(shape: BrushShape): { ex: number; ey: number } {
  switch (shape) {
    case 'circle': return { ex: 1.0, ey: 1.0 }
    case 'square': return { ex: 1.0, ey: 1.0 }
    case 'diamond': return { ex: 1.0, ey: 1.0 }
    case 'round': return { ex: 1.0, ey: 1.0 }
    case 'flat': return { ex: 2.0, ey: 0.25 }
    case 'dry': return { ex: 1.2, ey: 1.2 }
    case 'splatter': return { ex: 1.5, ey: 1.5 }
    case 'fan': return { ex: 2.0, ey: 0.5 }
    default: return { ex: 1.0, ey: 1.0 }
  }
}

export function getBrushOpacity(dx: number, dy: number, radius: number, shape: BrushShape): number {
  if (radius < 1) return 0

  const nx = dx / radius
  const ny = dy / radius
  const nd = Math.sqrt(nx * nx + ny * ny)
  const absNx = Math.abs(nx)
  const absNy = Math.abs(ny)

  switch (shape) {
    case 'circle':
      return nd <= 1 ? 1 : 0

    case 'square':
      return absNx <= 1 && absNy <= 1 ? 1 : 0

    case 'diamond':
      return absNx + absNy <= 1 ? 1 : 0

    case 'round':
      if (nd > 1) return 0
      return Math.max(0, 1 - nd * nd)

    case 'flat':
      if (absNx > 2.0 || absNy > 0.25) return 0
      return 0.5 + 0.5 * Math.max(0, 1 - absNx / 2.0)

    case 'dry':
      if (nd > 1.2) return 0
      if (fbm(nx * 3, ny * 3, 2) < 0.35) return 0
      return Math.max(0.1, (1 - nd / 1.2) * 0.7)

    case 'splatter': {
      if (nd > 1.5) return 0
      const key = Math.floor(hash2D(nx * 31, ny * 37) * 1000)
      const r = hash2D(key, key * 7)
      const angle = r * Math.PI * 2
      const dist = r * 1.2
      const pdx = nx - Math.cos(angle) * dist
      const pdy = ny - Math.sin(angle) * dist
      const pd = Math.sqrt(pdx * pdx + pdy * pdy)
      const dotR = 0.08 + hash2D(key + 1, key + 11) * 0.15
      return pd < dotR ? 1 : 0
    }

    case 'fan':
      if (absNy > 0.5 || nd > 2.0) return 0
      if (Math.abs(Math.atan2(ny, nx)) > Math.PI * 0.35) return 0
      return Math.min(0.8, Math.max(0, 1 - absNx / 2.0) * Math.max(0, 1 - absNy / 0.5))

    default:
      break
  }

  // brush shape — realistic paint brush with bristles
  const halfW = 2.0
  const halfH = 0.55

  if (absNx > halfW * 1.2 || absNy > halfH * 1.4) return 0

  const edgeNoise = fbm(nx * 0.8, ny * 0.8, 3)
  const wJit = halfW * (1 + 0.15 * (edgeNoise - 0.5))
  const hJit = halfH * (1 + 0.2 * (edgeNoise - 0.5))

  if (absNx > wJit || absNy > hJit) return 0

  const rightTaper = Math.max(0, 1 - (Math.max(0, nx - 0.5) / (halfW - 0.5)) * 0.6)
  const coreX = Math.max(0, 1 - absNx / (halfW * 0.7))
  const coreY = Math.max(0, 1 - absNy / (halfH * 0.7))
  const core = Math.max(0, coreX * coreY)

  const innerR = 0.75
  if (nd < innerR) return Math.max(0.85, core * rightTaper)

  if (absNy > halfH * 0.55) {
    const bristle = smoothNoise(nx * 3, ny * 15) > 0.35 ? 1 : 0
    const fringe = Math.max(0, 1 - (absNy - halfH * 0.55) / (halfH * 1.4 - halfH * 0.55))
    if (bristle > 0) return Math.min(1, fringe * 0.7 * rightTaper)
  }

  if (nx > 0.3) {
    const rightBristle = smoothNoise(ny * 14, nx * 0.5) > 0.4 ? 1 : 0
    const taper = Math.max(0, 1 - (nx - 0.3) / (halfW - 0.3))
    if (rightBristle > 0) return Math.min(1, taper * 0.6)
  }

  for (let i = 0; i < BRISTLE_PARTICLES.length; i++) {
    const p = BRISTLE_PARTICLES[i]
    const pdx = nx - p.nx
    const pdy = ny - p.ny
    const pd = Math.sqrt(pdx * pdx + pdy * pdy)
    const pR = p.size * halfH
    if (pd < pR) {
      const falloff = Math.max(0, 1 - pd / pR)
      return 0.4 + 0.6 * falloff
    }
  }

  return 0
}

// brush texture generation removed — was dead code
