import { useMemo } from 'react'
import * as THREE from 'three'
import { COLORS } from '@/utils/constants'

interface CardTextureOptions {
  code: string
  width?: number
  height?: number
}

/**
 * Creates a canvas texture for a card face.
 * Renders the number, subtitle text, and corner decorations.
 */
export function useCardTexture({ code, width = 512, height = 768 }: CardTextureOptions) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    // Background - transparent with subtle gradient
    ctx.clearRect(0, 0, width, height)
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.roundRect(0, 0, width, height, 32)
    ctx.fill()

    // Border
    ctx.strokeStyle = COLORS.glassBorder
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.roundRect(4, 4, width - 8, height - 8, 28)
    ctx.stroke()

    // Top accent line
    const topGradient = ctx.createLinearGradient(0, 0, width, 0)
    topGradient.addColorStop(0, 'transparent')
    topGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.6)')
    topGradient.addColorStop(1, 'transparent')
    ctx.strokeStyle = topGradient
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(30, 6)
    ctx.lineTo(width - 30, 6)
    ctx.stroke()

    // Corner decorations
    const cornerSize = 30
    const cornerOffset = 40
    ctx.strokeStyle = COLORS.glassBorder
    ctx.lineWidth = 2

    // Top-left
    ctx.beginPath()
    ctx.moveTo(cornerOffset, cornerOffset + cornerSize)
    ctx.lineTo(cornerOffset, cornerOffset)
    ctx.lineTo(cornerOffset + cornerSize, cornerOffset)
    ctx.stroke()

    // Top-right
    ctx.beginPath()
    ctx.moveTo(width - cornerOffset - cornerSize, cornerOffset)
    ctx.lineTo(width - cornerOffset, cornerOffset)
    ctx.lineTo(width - cornerOffset, cornerOffset + cornerSize)
    ctx.stroke()

    // Bottom-left
    ctx.beginPath()
    ctx.moveTo(cornerOffset, height - cornerOffset - cornerSize)
    ctx.lineTo(cornerOffset, height - cornerOffset)
    ctx.lineTo(cornerOffset + cornerSize, height - cornerOffset)
    ctx.stroke()

    // Bottom-right
    ctx.beginPath()
    ctx.moveTo(width - cornerOffset - cornerSize, height - cornerOffset)
    ctx.lineTo(width - cornerOffset, height - cornerOffset)
    ctx.lineTo(width - cornerOffset, height - cornerOffset - cornerSize)
    ctx.stroke()

    // Main number text
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'bold 88px "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
    ctx.fillStyle = COLORS.gold
    ctx.shadowColor = 'rgba(212, 175, 55, 0.4)'
    ctx.shadowBlur = 15
    ctx.fillText(`NO.${code}`, width / 2, height / 2 - 20)
    ctx.shadowBlur = 0

    // Divider line
    const dividerGradient = ctx.createLinearGradient(width / 2 - 60, 0, width / 2 + 60, 0)
    dividerGradient.addColorStop(0, 'transparent')
    dividerGradient.addColorStop(0.5, COLORS.glassBorder)
    dividerGradient.addColorStop(1, 'transparent')
    ctx.strokeStyle = dividerGradient
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(width / 2 - 60, height / 2 + 30)
    ctx.lineTo(width / 2 + 60, height / 2 + 30)
    ctx.stroke()

    // Subtitle text
    ctx.font = '22px "SF Pro Display", "PingFang SC", "Helvetica Neue", Arial, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillText('永恒之爱', width / 2, height / 2 + 70)

    ctx.font = '16px "SF Pro Display", "PingFang SC", "Helvetica Neue", Arial, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillText('幸运来宾', width / 2, height / 2 + 100)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [code, width, height])

  return texture
}
