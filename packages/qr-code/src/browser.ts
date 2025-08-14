export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
export type ColorMode = 'solid' | 'gradient'
export type GradientDirection =
  | 'horizontal'
  | 'vertical'
  | 'diagonal-down'
  | 'diagonal-up'

export type GenerateClientOptions = {
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
  centerImageUrl?: string | null
  overlayBackground?: string
  overlayRadius?: number
  overlayScale?: number
  format?: 'png' | 'blob'
}

// This file provides a thin client that defers to the server package or a hosted API.
// In browsers/React/Next.js client components/React Native, you should:
// - call your server endpoint, or
// - import the Node entry in server components or API routes.

export function buildApiUrl(
  baseUrl: string,
  params: Record<string, string>
): string {
  const usp = new URLSearchParams(params)
  return `${baseUrl}?${usp.toString()}`
}

export async function fetchQrcodeFromApi(
  baseUrl: string = 'https://qr-generator.dev/api/qrcode',
  options: GenerateClientOptions
): Promise<{ kind: 'blob'; data: string }> {
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
    format = 'png',
  } = options

  const params: Record<string, string> = { value, format }
  if (size) params.size = String(size)
  if (margin !== undefined) params.margin = String(margin)
  if (errorCorrectionLevel) params.errorCorrectionLevel = errorCorrectionLevel
  if (colorMode) params.colorMode = colorMode
  if (foregroundColor) params.foregroundColor = foregroundColor
  if (backgroundColor) params.backgroundColor = backgroundColor
  if (gradientStart) params.gradientStart = gradientStart
  if (gradientEnd) params.gradientEnd = gradientEnd
  if (gradientDirection) params.gradientDirection = gradientDirection
  if (centerImageUrl) params.centerImageUrl = centerImageUrl
  if (overlayBackground) params.overlayBackground = overlayBackground
  if (overlayRadius !== undefined) params.overlayRadius = String(overlayRadius)
  if (overlayScale !== undefined) params.overlayScale = String(overlayScale)

  const url = buildApiUrl(baseUrl, params)
  const res = await fetch(url)
  if (!res.ok) {
    try {
      const j = await res.json()
      throw new Error(j?.error ?? `Request failed: ${res.status}`)
    } catch {
      throw new Error(`Request failed: ${res.status}`)
    }
  }

  const blob = await res.blob()
  const buf = await blob.arrayBuffer()
  const base64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(buf).toString('base64')
      : btoa(String.fromCharCode(...new Uint8Array(buf)))
  return { kind: 'blob', data: `data:image/png;base64,${base64}` }
}
