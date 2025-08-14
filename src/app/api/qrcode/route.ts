import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import sharp from 'sharp'

type GradientDirection =
  | 'horizontal'
  | 'vertical'
  | 'diagonal-down'
  | 'diagonal-up'

function buildGradientSVG(
  size: number,
  start: string,
  end: string,
  direction: GradientDirection
) {
  const dir = (() => {
    switch (direction) {
      case 'horizontal':
        return { x1: '0%', y1: '0%', x2: '100%', y2: '0%' }
      case 'vertical':
        return { x1: '0%', y1: '0%', x2: '0%', y2: '100%' }
      case 'diagonal-up':
        return { x1: '0%', y1: '100%', x2: '100%', y2: '0%' }
      case 'diagonal-down':
      default:
        return { x1: '0%', y1: '0%', x2: '100%', y2: '100%' }
    }
  })()

  return Buffer.from(
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="${dir.x1}" y1="${dir.y1}" x2="${dir.x2}" y2="${dir.y2}">
      <stop offset="0%" stop-color="${start}"/>
      <stop offset="100%" stop-color="${end}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
</svg>`
  )
}

async function generateQrMask(
  text: string,
  size: number,
  margin: number,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
): Promise<Buffer> {
  // Transparent background, opaque modules
  const pngDataUrl = await QRCode.toDataURL(text, {
    width: size,
    margin,
    errorCorrectionLevel,
    color: { dark: '#000000', light: '#0000' },
  })
  const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, '')
  return Buffer.from(base64Data, 'base64')
}

async function renderPngQr(options: {
  value: string
  size: number
  margin: number
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  colorMode: 'solid' | 'gradient'
  foregroundColor: string
  backgroundColor: string
  gradientStart: string
  gradientEnd: string
  gradientDirection: GradientDirection
  centerImageUrl?: string | null
  overlayBackground: string
  overlayRadius: number
  overlayScale: number
}): Promise<Buffer> {
  const {
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
    centerImageUrl,
    overlayBackground,
    overlayRadius,
    overlayScale,
  } = options

  // Base background
  const base = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: backgroundColor,
    },
  })

  // Foreground layer (solid or gradient)
  const fgLayer =
    colorMode === 'gradient'
      ? sharp(
          buildGradientSVG(size, gradientStart, gradientEnd, gradientDirection)
        ).png()
      : sharp({
          create: {
            width: size,
            height: size,
            channels: 4,
            background: foregroundColor,
          },
        })

  const qrMask = await generateQrMask(value, size, margin, errorCorrectionLevel)

  // Apply QR mask to the foreground (keep fg only where QR modules are)
  const maskedFg = await fgLayer
    .composite([{ input: qrMask, blend: 'dest-in' }])
    .png()
    .toBuffer()

  let output = await base
    .composite([{ input: maskedFg }])
    .png()
    .toBuffer()

  // Center image overlay (optional)
  if (centerImageUrl) {
    try {
      const response = await fetch(centerImageUrl)
      if (response.ok) {
        const arr = await response.arrayBuffer()
        const overlaySize = Math.floor(size * overlayScale)
        const offset = Math.floor((size - overlaySize) / 2)

        // Rounded background behind the logo
        const roundedBgSvg = Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${overlaySize}" height="${overlaySize}">
  <rect x="0" y="0" width="${overlaySize}" height="${overlaySize}" rx="${overlayRadius}" ry="${overlayRadius}" fill="${overlayBackground}"/>
</svg>`
        )

        // Clip the image with rounded rect
        const roundedMaskSvg = Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${overlaySize}" height="${overlaySize}">
  <rect x="0" y="0" width="${overlaySize}" height="${overlaySize}" rx="${overlayRadius}" ry="${overlayRadius}" fill="#fff"/>
</svg>`
        )

        const clippedLogo = await sharp(Buffer.from(arr))
          .resize(overlaySize, overlaySize, { fit: 'cover' })
          .composite([{ input: roundedMaskSvg, blend: 'dest-in' }])
          .png()
          .toBuffer()

        // Compose in order: rounded bg, then clipped logo
        output = await sharp(output)
          .composite([
            { input: roundedBgSvg, left: offset, top: offset },
            { input: clippedLogo, left: offset, top: offset },
          ])
          .png()
          .toBuffer()
      }
    } catch {
      // ignore overlay errors and return base QR
    }
  }

  return output
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract and validate parameters
    const value = searchParams.get('value')
    const size = parseInt(searchParams.get('size') ?? '320')
    const margin = parseInt(searchParams.get('margin') ?? '2')
    const errorCorrectionLevel = searchParams.get('errorCorrectionLevel') ?? 'H'
    const colorMode = searchParams.get('colorMode') ?? 'solid'
    const foregroundColor = searchParams.get('foregroundColor') ?? '#000000'
    const backgroundColor = searchParams.get('backgroundColor') ?? '#FFFFFF'
    const gradientStart = searchParams.get('gradientStart') ?? '#8B5A3C'
    const gradientEnd = searchParams.get('gradientEnd') ?? '#F8BBD9'
    const gradientDirection =
      searchParams.get('gradientDirection') ?? 'diagonal-down'
    const format = searchParams.get('format') ?? 'png'
    const centerImageUrl = searchParams.get('centerImageUrl')
    const overlayBackground = searchParams.get('overlayBackground') ?? '#FFFFFF'
    const overlayRadius = parseInt(searchParams.get('overlayRadius') ?? '8')
    const overlayScale = parseFloat(searchParams.get('overlayScale') ?? '0.24')

    // Validation
    if (!value || value.trim() === '') {
      return NextResponse.json(
        { error: 'Missing or empty value parameter' },
        { status: 400 }
      )
    }

    if (size < 64 || size > 2048) {
      return NextResponse.json(
        { error: 'Size must be between 64 and 2048' },
        { status: 400 }
      )
    }

    if (margin < 0 || margin > 10) {
      return NextResponse.json(
        { error: 'Margin must be between 0 and 10' },
        { status: 400 }
      )
    }

    if (!['L', 'M', 'Q', 'H'].includes(errorCorrectionLevel)) {
      return NextResponse.json(
        { error: 'Error correction level must be L, M, Q, or H' },
        { status: 400 }
      )
    }

    if (!['solid', 'gradient'].includes(colorMode)) {
      return NextResponse.json(
        { error: 'Color mode must be solid or gradient' },
        { status: 400 }
      )
    }

    if (
      !['horizontal', 'vertical', 'diagonal-down', 'diagonal-up'].includes(
        gradientDirection
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Gradient direction must be horizontal, vertical, diagonal-down, or diagonal-up',
        },
        { status: 400 }
      )
    }

    if (!['png', 'svg', 'blob'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be png, svg, or blob' },
        { status: 400 }
      )
    }

    if (overlayScale < 0.1 || overlayScale > 0.5) {
      return NextResponse.json(
        { error: 'Overlay scale must be between 0.1 and 0.5' },
        { status: 400 }
      )
    }

    if (overlayRadius < 0 || overlayRadius > 50) {
      return NextResponse.json(
        { error: 'Overlay radius must be between 0 and 50' },
        { status: 400 }
      )
    }

    // Validate color formats (basic hex validation)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (!hexColorRegex.test(foregroundColor)) {
      return NextResponse.json(
        {
          error:
            'Invalid foreground color format. Use hex format (e.g., #000000)',
        },
        { status: 400 }
      )
    }

    if (!hexColorRegex.test(backgroundColor)) {
      return NextResponse.json(
        {
          error:
            'Invalid background color format. Use hex format (e.g., #FFFFFF)',
        },
        { status: 400 }
      )
    }

    if (colorMode === 'gradient') {
      if (!hexColorRegex.test(gradientStart)) {
        return NextResponse.json(
          {
            error:
              'Invalid gradient start color format. Use hex format (e.g., #8B5A3C)',
          },
          { status: 400 }
        )
      }

      if (!hexColorRegex.test(gradientEnd)) {
        return NextResponse.json(
          {
            error:
              'Invalid gradient end color format. Use hex format (e.g., #F8BBD9)',
          },
          { status: 400 }
        )
      }
    }

    if (!hexColorRegex.test(overlayBackground)) {
      return NextResponse.json(
        {
          error:
            'Invalid overlay background color format. Use hex format (e.g., #FFFFFF)',
        },
        { status: 400 }
      )
    }

    // Generate QR code options
    const qrOptions: any = {
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
    }

    // Render. If gradients or overlay are used, force PNG/blob pipeline
    const mustRaster = colorMode === 'gradient' || !!centerImageUrl

    if (!mustRaster && format === 'svg') {
      const svg = await QRCode.toString(value, { ...qrOptions, type: 'svg' })
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    // Use PNG path for everything else (supports gradients and overlay)
    const pngBuffer = await renderPngQr({
      value,
      size,
      margin,
      errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
      colorMode: colorMode as 'solid' | 'gradient',
      foregroundColor,
      backgroundColor,
      gradientStart,
      gradientEnd,
      gradientDirection: gradientDirection as GradientDirection,
      centerImageUrl: centerImageUrl ?? undefined,
      overlayBackground,
      overlayRadius,
      overlayScale,
    })

    return new NextResponse(pngBuffer as any, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('QR Code generation error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `QR code generation failed: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error during QR code generation' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract and validate parameters from JSON body
    const {
      value,
      size = 320,
      margin = 2,
      errorCorrectionLevel = 'H',
      colorMode = 'solid',
      foregroundColor = '#000000',
      backgroundColor = '#FFFFFF',
      gradientStart = '#8B5A3C',
      gradientEnd = '#F8BBD9',
      gradientDirection = 'diagonal-down',
      format = 'png',
      centerImageUrl,
      overlayBackground = '#FFFFFF',
      overlayRadius = 8,
      overlayScale = 0.24,
    } = body

    // Validation (same as GET)
    if (!value || value.trim() === '') {
      return NextResponse.json(
        { error: 'Missing or empty value parameter' },
        { status: 400 }
      )
    }

    if (size < 64 || size > 2048) {
      return NextResponse.json(
        { error: 'Size must be between 64 and 2048' },
        { status: 400 }
      )
    }

    if (margin < 0 || margin > 10) {
      return NextResponse.json(
        { error: 'Margin must be between 0 and 10' },
        { status: 400 }
      )
    }

    if (!['L', 'M', 'Q', 'H'].includes(errorCorrectionLevel)) {
      return NextResponse.json(
        { error: 'Error correction level must be L, M, Q, or H' },
        { status: 400 }
      )
    }

    if (!['solid', 'gradient'].includes(colorMode)) {
      return NextResponse.json(
        { error: 'Color mode must be solid or gradient' },
        { status: 400 }
      )
    }

    if (
      !['horizontal', 'vertical', 'diagonal-down', 'diagonal-up'].includes(
        gradientDirection
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Gradient direction must be horizontal, vertical, diagonal-down, or diagonal-up',
        },
        { status: 400 }
      )
    }

    if (!['png', 'svg', 'blob'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be png, svg, or blob' },
        { status: 400 }
      )
    }

    if (overlayScale < 0.1 || overlayScale > 0.5) {
      return NextResponse.json(
        { error: 'Overlay scale must be between 0.1 and 0.5' },
        { status: 400 }
      )
    }

    if (overlayRadius < 0 || overlayRadius > 50) {
      return NextResponse.json(
        { error: 'Overlay radius must be between 0 and 50' },
        { status: 400 }
      )
    }

    // Validate color formats
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (!hexColorRegex.test(foregroundColor)) {
      return NextResponse.json(
        {
          error:
            'Invalid foreground color format. Use hex format (e.g., #000000)',
        },
        { status: 400 }
      )
    }

    if (!hexColorRegex.test(backgroundColor)) {
      return NextResponse.json(
        {
          error:
            'Invalid background color format. Use hex format (e.g., #FFFFFF)',
        },
        { status: 400 }
      )
    }

    if (colorMode === 'gradient') {
      if (!hexColorRegex.test(gradientStart)) {
        return NextResponse.json(
          {
            error:
              'Invalid gradient start color format. Use hex format (e.g., #8B5A3C)',
          },
          { status: 400 }
        )
      }

      if (!hexColorRegex.test(gradientEnd)) {
        return NextResponse.json(
          {
            error:
              'Invalid gradient end color format. Use hex format (e.g., #F8BBD9)',
          },
          { status: 400 }
        )
      }
    }

    if (!hexColorRegex.test(overlayBackground)) {
      return NextResponse.json(
        {
          error:
            'Invalid overlay background color format. Use hex format (e.g., #FFFFFF)',
        },
        { status: 400 }
      )
    }

    // Generate QR code options
    const qrOptions: any = {
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
    }

    // Render
    if (format === 'svg' && colorMode === 'solid' && !centerImageUrl) {
      const svg = await QRCode.toString(value, { ...qrOptions, type: 'svg' })
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    const pngBuffer = await renderPngQr({
      value,
      size,
      margin,
      errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
      colorMode: colorMode as 'solid' | 'gradient',
      foregroundColor,
      backgroundColor,
      gradientStart,
      gradientEnd,
      gradientDirection: gradientDirection as GradientDirection,
      centerImageUrl: centerImageUrl ?? undefined,
      overlayBackground,
      overlayRadius,
      overlayScale,
    })

    return new NextResponse(pngBuffer as any, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('QR Code generation error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `QR code generation failed: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error during QR code generation' },
      { status: 400 }
    )
  }
}
