import { useMemo } from 'react'
import * as THREE from 'three'

interface CardTextureOptions {
  code: string
  width?: number
  height?: number
}

const textureCache = new Map<string, THREE.CanvasTexture>()

function createCardTexture({ code, width, height }: Required<CardTextureOptions>) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  const bg = ctx.createLinearGradient(0, 0, 0, height)
  bg.addColorStop(0, '#fffaf4')
  bg.addColorStop(0.55, '#fff1e5')
  bg.addColorStop(1, '#ffe5d6')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  const blush = ctx.createRadialGradient(width * 0.25, height * 0.18, 0, width * 0.25, height * 0.18, width * 0.35)
  blush.addColorStop(0, 'rgba(255, 205, 214, 0.34)')
  blush.addColorStop(1, 'rgba(255, 205, 214, 0)')
  ctx.fillStyle = blush
  ctx.fillRect(0, 0, width, height)

  const goldGlow = ctx.createRadialGradient(width * 0.78, height * 0.16, 0, width * 0.78, height * 0.16, width * 0.28)
  goldGlow.addColorStop(0, 'rgba(246, 215, 164, 0.28)')
  goldGlow.addColorStop(1, 'rgba(246, 215, 164, 0)')
  ctx.fillStyle = goldGlow
  ctx.fillRect(0, 0, width, height)

  const inset = 12
  ctx.strokeStyle = 'rgba(191, 88, 118, 0.34)'
  ctx.lineWidth = 1.8
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2)

  ctx.strokeStyle = 'rgba(246, 215, 164, 0.9)'
  ctx.lineWidth = 2.6
  ctx.strokeRect(inset + 8, inset + 8, width - (inset + 8) * 2, height - (inset + 8) * 2)

  for (let i = 0; i < 8; i++) {
    const x = width * 0.16 + i * width * 0.095
    const y = height * 0.12 + Math.sin(i * 0.9) * 3
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 205, 214, 0.9)' : 'rgba(246, 215, 164, 0.82)'
    ctx.fill()
  }

  const numberFontSize =
    code.length >= 8
      ? Math.floor(width * 0.135)
      : code.length >= 7
        ? Math.floor(width * 0.165)
        : Math.floor(width * 0.26)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `300 ${Math.floor(width * 0.06)}px "Outfit", system-ui, sans-serif`
  ctx.fillStyle = 'rgba(174, 90, 116, 0.88)'
  ctx.fillText('婚礼幸运签', width / 2, height * 0.2)

  ctx.font = `bold ${numberFontSize}px "Outfit", "SF Pro Display", system-ui, sans-serif`
  ctx.fillStyle = '#8c233f'
  ctx.shadowColor = 'rgba(255, 210, 174, 0.46)'
  ctx.shadowBlur = 10
  ctx.fillText(code, width / 2, height * 0.41)
  ctx.shadowBlur = 0

  const divY = height * 0.56
  const divGrad = ctx.createLinearGradient(width * 0.2, 0, width * 0.8, 0)
  divGrad.addColorStop(0, 'transparent')
  divGrad.addColorStop(0.5, 'rgba(217, 168, 95, 0.58)')
  divGrad.addColorStop(1, 'transparent')
  ctx.strokeStyle = divGrad
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(width * 0.2, divY)
  ctx.lineTo(width * 0.8, divY)
  ctx.stroke()

  ctx.font = `400 ${Math.floor(width * 0.055)}px "Outfit", system-ui, sans-serif`
  ctx.fillStyle = 'rgba(140, 35, 63, 0.76)'
  ctx.fillText('Lucky Wedding Day', width / 2, height * 0.68)

  ctx.font = `300 ${Math.floor(width * 0.04)}px "Outfit", system-ui, sans-serif`
  ctx.fillStyle = 'rgba(174, 90, 116, 0.54)'
  ctx.fillText(code, width / 2, height * 0.79)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(width * 0.24, height * 0.86)
  ctx.bezierCurveTo(width * 0.34, height * 0.8, width * 0.42, height * 0.92, width * 0.5, height * 0.86)
  ctx.bezierCurveTo(width * 0.58, height * 0.8, width * 0.66, height * 0.92, width * 0.76, height * 0.86)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipMapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

/**
 * Creates a softer invitation-style wedding card so the backdrop matches
 * the chibi couple instead of fighting them with a hard sci-fi material.
 */
export function useCardTexture({ code, width = 192, height = 320 }: CardTextureOptions) {
  const texture = useMemo(() => {
    const cacheKey = `${code}:${width}x${height}`
    const cached = textureCache.get(cacheKey)
    if (cached) return cached

    const nextTexture = createCardTexture({ code, width, height })
    textureCache.set(cacheKey, nextTexture)
    return nextTexture
  }, [code, width, height])

  return texture
}
