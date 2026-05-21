import { useMemo } from 'react'
import * as THREE from 'three'
import { COLORS } from '@/utils/constants'

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

  // Background — deep black with subtle charcoal gradient
  const bg = ctx.createLinearGradient(0, 0, 0, height)
  bg.addColorStop(0, '#1a1a24')
  bg.addColorStop(0.5, '#101018')
  bg.addColorStop(1, '#0a0a0f')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  // Subtle gold edge lighting from top
  const glow = ctx.createRadialGradient(width * 0.5, 0, 0, width * 0.5, 0, width * 0.7)
  glow.addColorStop(0, 'rgba(201, 168, 76, 0.06)')
  glow.addColorStop(1, 'rgba(201, 168, 76, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  // Single clean gold border
  const inset = 12
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.35)'
  ctx.lineWidth = 1.2
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2)

  // L-shaped corner accents
  const cornerLen = 16
  ctx.strokeStyle = 'rgba(240, 215, 140, 0.55)'
  ctx.lineWidth = 1.8
  const corners = [
    { x: inset, y: inset, dx: 1, dy: 1 },
    { x: width - inset, y: inset, dx: -1, dy: 1 },
    { x: inset, y: height - inset, dx: 1, dy: -1 },
    { x: width - inset, y: height - inset, dx: -1, dy: -1 },
  ]
  for (const { x, y, dx, dy } of corners) {
    ctx.beginPath()
    ctx.moveTo(x + dx * cornerLen, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + dy * cornerLen)
    ctx.stroke()
  }

  // Small "NO." label above number
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `300 ${Math.floor(width * 0.06)}px "Outfit", system-ui, sans-serif`
  ctx.fillStyle = 'rgba(232, 213, 163, 0.45)'
  ctx.fillText('NO.', width / 2, height * 0.28)

  // Main number — large, champagne gold, centered
  ctx.font = `bold ${Math.floor(width * 0.26)}px "Outfit", "SF Pro Display", system-ui, sans-serif`
  ctx.fillStyle = COLORS.goldBright
  ctx.shadowColor = 'rgba(201, 168, 76, 0.4)'
  ctx.shadowBlur = 10
  ctx.fillText(code, width / 2, height * 0.42)
  ctx.shadowBlur = 0

  // Thin divider
  const divY = height * 0.56
  const divGrad = ctx.createLinearGradient(width * 0.2, 0, width * 0.8, 0)
  divGrad.addColorStop(0, 'transparent')
  divGrad.addColorStop(0.5, 'rgba(201, 168, 76, 0.3)')
  divGrad.addColorStop(1, 'transparent')
  ctx.strokeStyle = divGrad
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(width * 0.2, divY)
  ctx.lineTo(width * 0.8, divY)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.generateMipmaps = false
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.anisotropy = 1
  tex.needsUpdate = true
  return tex
}

/**
 * Creates a premium dark card texture with champagne gold accents.
 * Noir Luxe aesthetic — black surface, gold typography, L-shaped corners.
 */
export function useCardTexture({ code, width = 256, height = 424 }: CardTextureOptions) {
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
