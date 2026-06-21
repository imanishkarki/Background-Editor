import { describe, it, expect } from 'vitest'
import { rgbToHex, getPixelColor, getSelectedColor } from './color'

describe('rgbToHex', () => {
  it('converts basic RGB to hex', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#FF0000')
    expect(rgbToHex(0, 255, 0)).toBe('#00FF00')
    expect(rgbToHex(0, 0, 255)).toBe('#0000FF')
  })

  it('handles black and white', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
    expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF')
  })

  it('clamps values below 0', () => {
    expect(rgbToHex(-10, 0, 0)).toBe('#000000')
    expect(rgbToHex(0, -1, 0)).toBe('#000000')
  })

  it('clamps values above 255', () => {
    expect(rgbToHex(300, 0, 0)).toBe('#FF0000')
    expect(rgbToHex(0, 256, 0)).toBe('#00FF00')
  })

  it('rounds fractional values', () => {
    expect(rgbToHex(127.1, 127.5, 127.9)).toBe('#7F80FF')
  })

  it('returns uppercase hex', () => {
    const result = rgbToHex(171, 205, 239)
    expect(result).toBe(result.toUpperCase())
    expect(result).toBe('#ABCDEF')
  })
})

function makeImageData(width: number, height: number, fill: [number, number, number, number] = [128, 128, 128, 255]): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = fill[0]
    data[i * 4 + 1] = fill[1]
    data[i * 4 + 2] = fill[2]
    data[i * 4 + 3] = fill[3]
  }
  return new ImageData(data, width, height)
}

describe('getPixelColor', () => {
  it('returns color at the given coordinates', () => {
    const imageData = makeImageData(10, 10, [255, 100, 50, 255])
    expect(getPixelColor(imageData, 5, 5)).toEqual({ r: 255, g: 100, b: 50 })
  })

  it('clamps x to image bounds', () => {
    const imageData = makeImageData(10, 10, [0, 255, 0, 255])
    expect(getPixelColor(imageData, -5, 0)).toEqual({ r: 0, g: 255, b: 0 })
    expect(getPixelColor(imageData, 100, 0)).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('clamps y to image bounds', () => {
    const imageData = makeImageData(10, 10, [255, 0, 0, 255])
    expect(getPixelColor(imageData, 0, -1)).toEqual({ r: 255, g: 0, b: 0 })
    expect(getPixelColor(imageData, 0, 50)).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('handles different pixel colors in the same image', () => {
    const data = new Uint8ClampedArray(4 * 4)
    data[0] = 255; data[1] = 0; data[2] = 0; data[3] = 255
    data[4] = 0; data[5] = 255; data[6] = 0; data[7] = 255
    const imageData = new ImageData(data, 2, 1)
    expect(getPixelColor(imageData, 0, 0)).toEqual({ r: 255, g: 0, b: 0 })
    expect(getPixelColor(imageData, 1, 0)).toEqual({ r: 0, g: 255, b: 0 })
  })
})

describe('getSelectedColor', () => {
  it('returns rgb and hex for a pixel', () => {
    const imageData = makeImageData(5, 5, [10, 20, 30, 255])
    const result = getSelectedColor(imageData, 2, 2)
    expect(result.rgb).toEqual({ r: 10, g: 20, b: 30 })
    expect(result.hex).toBe('#0A141E')
  })
})
