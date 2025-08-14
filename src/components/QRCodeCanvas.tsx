'use client'

import QRCode from 'qrcode'
import React, {
  CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'

type GradientDirection =
  | 'horizontal'
  | 'vertical'
  | 'diagonal-down'
  | 'diagonal-up'

type Props = {
  value: string
  size?: number
  margin?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  // Color modes
  colorMode?: 'solid' | 'gradient'
  foregroundColor?: string
  backgroundColor?: string
  gradientStart?: string
  gradientEnd?: string
  gradientDirection?: GradientDirection
  // Optional center image
  centerImageFile?: File | null
  centerImageSrc?: string | null
  overlayBackground?: string
  overlayRadius?: number
  overlayScale?: number // relative to size, default 0.24
  // DOM
  className?: string
  style?: CSSProperties
  onRender?: (canvas: HTMLCanvasElement) => void
}

const defaultProps = {
  size: 320,
  margin: 2,
  errorCorrectionLevel: 'H' as const,
  colorMode: 'solid' as const,
  foregroundColor: '#000000',
  backgroundColor: '#FFFFFF',
  gradientStart: '#8B5A3C',
  gradientEnd: '#F8BBD9',
  gradientDirection: 'diagonal-down' as GradientDirection,
  centerImageFile: null,
  centerImageSrc: null,
  overlayBackground: '#FFFFFF',
  overlayRadius: 8,
  overlayScale: 0.24,
}

function createGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  direction: GradientDirection,
  start: string,
  end: string
) {
  let gradient: CanvasGradient
  switch (direction) {
    case 'horizontal':
      gradient = ctx.createLinearGradient(0, 0, width, 0)
      break
    case 'vertical':
      gradient = ctx.createLinearGradient(0, 0, 0, height)
      break
    case 'diagonal-down':
      gradient = ctx.createLinearGradient(0, 0, width, height)
      break
    case 'diagonal-up':
      gradient = ctx.createLinearGradient(0, height, width, 0)
      break
  }
  gradient.addColorStop(0, start)
  gradient.addColorStop(1, end)
  return gradient
}

async function drawCenterImage(
  canvas: HTMLCanvasElement,
  src: string,
  overlayBackground: string,
  overlayRadius: number,
  overlayScale: number
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
  const size = Math.min(canvas.width, canvas.height)
  const overlaySize = Math.floor(size * overlayScale)
  const x = Math.floor((size - overlaySize) / 2)
  const y = Math.floor((size - overlaySize) / 2)

  // Rounded background
  if ((ctx as any).roundRect) {
    ctx.save()
    ;(ctx as any).roundRect(x, y, overlaySize, overlaySize, overlayRadius)
    ctx.fillStyle = overlayBackground
    ctx.fill()
    ctx.restore()
  } else {
    ctx.fillStyle = overlayBackground
    ctx.fillRect(x, y, overlaySize, overlaySize)
  }

  ctx.drawImage(img, x, y, overlaySize, overlaySize)
}

export type QRCodeCanvasRef = HTMLCanvasElement

const QRCodeCanvas = forwardRef<QRCodeCanvasRef, Props>(function QRCodeCanvas(
  props: Props,
  ref
) {
  const {
    value,
    size = defaultProps.size,
    margin = defaultProps.margin,
    errorCorrectionLevel = defaultProps.errorCorrectionLevel,
    colorMode = defaultProps.colorMode,
    foregroundColor = defaultProps.foregroundColor,
    backgroundColor = defaultProps.backgroundColor,
    gradientStart = defaultProps.gradientStart,
    gradientEnd = defaultProps.gradientEnd,
    gradientDirection = defaultProps.gradientDirection,
    centerImageFile = defaultProps.centerImageFile,
    centerImageSrc = defaultProps.centerImageSrc,
    overlayBackground = defaultProps.overlayBackground,
    overlayRadius = defaultProps.overlayRadius,
    overlayScale = defaultProps.overlayScale,
    className,
    style,
    onRender,
  } = props

  const canvasRef = useRef<HTMLCanvasElement>(null!)

  useImperativeHandle(ref, () => canvasRef.current, [])

  const isGradientActive = useMemo(() => colorMode === 'gradient', [colorMode])

  useEffect(() => {
    const render = async () => {
      if (!value) return
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = size
      canvas.height = size

      const mask = document.createElement('canvas')
      mask.width = size
      mask.height = size
      await QRCode.toCanvas(mask, value, {
        width: size,
        margin,
        errorCorrectionLevel,
        color: { dark: '#000000', light: '#0000' },
      })

      // Background
      ctx.clearRect(0, 0, size, size)
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, size, size)

      // Foreground fill + mask
      if (isGradientActive) {
        const grad = createGradient(
          ctx,
          size,
          size,
          gradientDirection,
          gradientStart,
          gradientEnd
        )
        ctx.fillStyle = grad
      } else {
        ctx.fillStyle = foregroundColor
      }
      ctx.fillRect(0, 0, size, size)
      ctx.globalCompositeOperation = 'destination-in'
      ctx.drawImage(mask, 0, 0)
      ctx.globalCompositeOperation = 'source-over'

      // Center image overlay
      let overlaySrc: string | null = null
      if (centerImageSrc) overlaySrc = centerImageSrc
      else if (centerImageFile)
        overlaySrc = URL.createObjectURL(centerImageFile)

      try {
        if (overlaySrc) {
          await drawCenterImage(
            canvas,
            overlaySrc,
            overlayBackground,
            overlayRadius,
            overlayScale ?? defaultProps.overlayScale
          )
        }
      } finally {
        if (centerImageFile && overlaySrc) {
          URL.revokeObjectURL(overlaySrc)
        }
      }

      onRender?.(canvas)
    }

    void render()
  }, [
    value,
    size,
    margin,
    errorCorrectionLevel,
    colorMode,
    foregroundColor,
    backgroundColor,
    gradientStart,
    gradientEnd,
    gradientDirection,
    centerImageFile,
    centerImageSrc,
    overlayBackground,
    overlayRadius,
    overlayScale,
    onRender,
    isGradientActive,
  ])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={style}
    />
  )
})

export default QRCodeCanvas
