import { useMemo } from 'react'
import * as THREE from 'three'
import { COLORS } from '@/utils/constants'

interface CardTextureOptions {
  code: string
  width?: number
  height?: number
}

/**
 * Creates an elegant card texture with Korean minimalist aesthetic.
 * Clean typography, subtle gold accent, generous whitespace.
 */
export function useCardTexture({ code, width = 360, height = 600 }: CardTextureOptions) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    // Background — deep dark with very subtle gradient
    const bg = ctx.createLinearGradient(0, 0, 0, height)
    bg.addColorStop(0, 'rgba(15, 15, 30, 0.95)')
    bg.addColorStop(1, 'rgba(8, 8, 20, 0.98)')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)

    // Subtle border — thin gold line
    ctx.strokeStyle = COLORS.glassBorder
    ctx.lineWidth = 1.5
    const inset = 16
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2)

    // Top accent — thin bright line
    const topGrad = ctx.createLinearGradient(width * 0.2, 0, width * 0.8, 0)
    topGrad.addColorStop(0, 'transparent')
    topGrad.addColorStop(0.5, COLORS.gold)
    topGrad.addColorStop(1, 'transparent')
    ctx.strokeStyle = topGrad
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(width * 0.2, inset)
    ctx.lineTo(width * 0.8, inset)
    ctx.stroke()

    // Main number — large, centered, elegant
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${Math.floor(width * 0.2)}px "SF Pro Display", "Helvetica Neue", system-ui, sans-serif`
    ctx.fillStyle = COLORS.goldLight
    ctx.shadowColor = 'rgba(201, 169, 110, 0.3)'
    ctx.shadowBlur = 8
    ctx.fillText(`NO.${code}`, width / 2, height * 0.42)
    ctx.shadowBlur = 0

    // Thin divider
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.2)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(width * 0.3, height * 0.55)
    ctx.lineTo(width * 0.7, height * 0.55)
    ctx.stroke()

    // Subtitle — small, delicate
    ctx.font = `300 ${Math.floor(width * 0.045)}px "PingFang SC", "SF Pro Display", system-ui, sans-serif`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.fillText('永恒之爱', width / 2, height * 0.63)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [code, width, height])

  return texture
}
