import QRCode from 'qrcode'
import sharp from 'sharp'

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
export type ColorMode = 'solid' | 'gradient'
export type GradientDirection =
  | 'horizontal'
  | 'vertical'
  | 'diagonal-down'
  | 'diagonal-up'

export type GenerateOptions = {
  value: string
  size?: number
  margin?: number
  errorCorrectionLevel?: ErrorCorrectionLevel
  colorMode?: ColorMode
  foregroundColor?: string
  backgroundColor?: string
  gradientStart?: string
  gradientEnd?: string
  gradientDirection?: GradientDirection
  centerImageBuffer?: Buffer | null
  centerImageUrl?: string | null
  overlayBackground?: string
  overlayRadius?: number
  overlayScale?: number
}

const DEFAULTS = {
  size: 320,
  margin: 2,
  ecl: 'H' as ErrorCorrectionLevel,
  colorMode: 'solid' as ColorMode,
  foreground: '#000000',
  background: '#FFFFFF',
  gradientStart: '#8B5A3C',
  gradientEnd: '#F8BBD9',
  gradientDirection: 'diagonal-down' as GradientDirection,
  overlayBackground: '#FFFFFF',
  overlayRadius: 8,
  overlayScale: 0.24,
}

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
  errorCorrectionLevel: ErrorCorrectionLevel
): Promise<Buffer> {
  const pngDataUrl = await QRCode.toDataURL(text, {
    width: size,
    margin,
    errorCorrectionLevel,
    color: { dark: '#000000', light: '#0000' },
  })
  const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, '')
  return Buffer.from(base64Data, 'base64')
}

export async function generatePngBuffer(
  opts: GenerateOptions
): Promise<Buffer> {
  const size = opts.size ?? DEFAULTS.size
  const margin = opts.margin ?? DEFAULTS.margin
  const ecl = opts.errorCorrectionLevel ?? DEFAULTS.ecl
  const colorMode = opts.colorMode ?? DEFAULTS.colorMode
  const foreground = opts.foregroundColor ?? DEFAULTS.foreground
  const background = opts.backgroundColor ?? DEFAULTS.background
  const gradientStart = opts.gradientStart ?? DEFAULTS.gradientStart
  const gradientEnd = opts.gradientEnd ?? DEFAULTS.gradientEnd
  const gradientDirection = opts.gradientDirection ?? DEFAULTS.gradientDirection
  const overlayBackground = opts.overlayBackground ?? DEFAULTS.overlayBackground
  const overlayRadius = opts.overlayRadius ?? DEFAULTS.overlayRadius
  const overlayScale = opts.overlayScale ?? DEFAULTS.overlayScale

  const base = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })

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
            background: foreground,
          },
        })

  const qrMask = await generateQrMask(opts.value, size, margin, ecl)
  const maskedFg = await fgLayer
    .composite([{ input: qrMask, blend: 'dest-in' }])
    .png()
    .toBuffer()

  let output = await base
    .composite([{ input: maskedFg }])
    .png()
    .toBuffer()

  // Center image overlay
  const overlaySize = Math.floor(size * overlayScale)
  const offset = Math.floor((size - overlaySize) / 2)
  const roundedBgSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${overlaySize}" height="${overlaySize}">
  <rect x="0" y="0" width="${overlaySize}" height="${overlaySize}" rx="${overlayRadius}" ry="${overlayRadius}" fill="${overlayBackground}"/>
</svg>`
  )

  let centerBuffer: Buffer | null = null
  if (opts.centerImageBuffer) centerBuffer = opts.centerImageBuffer
  else if (opts.centerImageUrl) {
    try {
      const res = await fetch(opts.centerImageUrl)
      if (res.ok) {
        const arr = await res.arrayBuffer()
        centerBuffer = Buffer.from(arr)
      }
    } catch {
      // ignore
    }
  }

  if (centerBuffer) {
    const maskSvg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${overlaySize}" height="${overlaySize}">
  <rect x="0" y="0" width="${overlaySize}" height="${overlaySize}" rx="${overlayRadius}" ry="${overlayRadius}" fill="#fff"/>
</svg>`
    )
    const clipped = await sharp(centerBuffer)
      .resize(overlaySize, overlaySize, { fit: 'cover' })
      .composite([{ input: maskSvg, blend: 'dest-in' }])
      .png()
      .toBuffer()

    output = await sharp(output)
      .composite([
        { input: roundedBgSvg, left: offset, top: offset },
        { input: clipped, left: offset, top: offset },
      ])
      .png()
      .toBuffer()
  }

  return output
}

export async function generatePngDataUrl(
  opts: GenerateOptions
): Promise<string> {
  const buf = await generatePngBuffer(opts)
  const base64 = Buffer.from(buf).toString('base64')
  return `data:image/png;base64,${base64}`
}

export default {
  generatePngBuffer,
  generatePngDataUrl,
}

// ---------------- Convenience content helpers ----------------

export type ContentInput =
  | { type: 'raw'; value: string }
  | { type: 'text'; text: string }
  | { type: 'url'; url: string }
  | { type: 'email'; email: string; subject?: string; body?: string }
  | {
      type: 'contact'
      firstName?: string
      lastName?: string
      phone?: string
      email?: string
      organization?: string
    }

export function buildContent(input: ContentInput): string {
  switch (input.type) {
    case 'raw':
      return (input.value ?? '').trim()
    case 'text':
      return (input.text ?? '').trim()
    case 'url': {
      const t = (input.url ?? '').trim()
      if (!t) return ''
      return /^https?:\/\//i.test(t) ? t : `https://${t}`
    }
    case 'email': {
      const email = (input.email ?? '').trim()
      if (!email) return ''
      const params = new URLSearchParams()
      if (input.subject?.trim()) params.set('subject', input.subject.trim())
      if (input.body?.trim()) params.set('body', input.body.trim())
      const query = params.toString()
      return query ? `mailto:${email}?${query}` : `mailto:${email}`
    }
    case 'contact': {
      const firstName = (input.firstName ?? '').trim()
      const lastName = (input.lastName ?? '').trim()
      const phone = (input.phone ?? '').trim()
      const email = (input.email ?? '').trim()
      const organization = (input.organization ?? '').trim()
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName};${firstName};;;`,
        `FN:${fullName || `${firstName} ${lastName}`.trim()}`,
      ]
      if (organization) lines.push(`ORG:${organization}`)
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`)
      if (email) lines.push(`EMAIL:${email}`)
      lines.push('END:VCARD')
      return lines.join('\r\n')
    }
  }
}

export type GenerateBase64Options = Omit<GenerateOptions, 'value'> & {
  content: ContentInput
}

export async function generateBase64FromContent(
  opts: GenerateBase64Options
): Promise<string> {
  const { content, ...rest } = opts
  const value = buildContent(content)
  return generatePngDataUrl({ ...(rest as GenerateOptions), value })
}

export async function generateBase64(opts: GenerateOptions): Promise<string> {
  return generatePngDataUrl(opts)
}
