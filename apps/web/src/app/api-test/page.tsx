'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function APITestPage() {
  const [getUrl, setGetUrl] = useState('https://example.com')
  const [size, setSize] = useState('320')
  const [colorMode, setColorMode] = useState<'solid' | 'gradient'>('solid')
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [gradientStart, setGradientStart] = useState('#8B5A3C')
  const [gradientEnd, setGradientEnd] = useState('#F8BBD9')
  const [gradientDirection, setGradientDirection] = useState('diagonal-down')
  const [format, setFormat] = useState('png')
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('H')
  const [margin, setMargin] = useState('2')
  const [centerImageUrl, setCenterImageUrl] = useState('')
  const [overlayBackground, setOverlayBackground] = useState('#FFFFFF')
  const [overlayRadius, setOverlayRadius] = useState('8')
  const [overlayScale, setOverlayScale] = useState('0.24')
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const svgAvailable = colorMode === 'solid' && !centerImageUrl
  const hasInteractedRef = useRef(false)

  useEffect(() => {
    if (!svgAvailable && format === 'svg') {
      setFormat('blob')
    }
  }, [svgAvailable, format])

  // Auto-regenerate when user changes format after first generate
  useEffect(() => {
    if (hasInteractedRef.current) {
      void testGetAPI()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format])

  const testGetAPI = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      const params = new URLSearchParams({
        value: getUrl,
        size,
        margin,
        errorCorrectionLevel,
        colorMode,
        foregroundColor,
        backgroundColor,
        gradientStart,
        gradientEnd,
        gradientDirection,
        format,
        centerImageUrl,
        overlayBackground,
        overlayRadius,
        overlayScale,
      })

      const response = await fetch(`/api/qrcode?${params}`)

      if (!response.ok) {
        const errorData = await response.json()
        setError(`Error ${response.status}: ${errorData.error}`)
        return
      }

      if (format === 'svg') {
        const svgText = await response.text()
        setResult(svgText)
      } else if (format === 'blob') {
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        const dataUrl = `data:image/png;base64,${base64}`
        setResult(dataUrl)
      } else {
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        setResult(imageUrl)
      }
    } catch (err) {
      setError(
        `Request failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            QR Code API Test
          </h1>
          <p className="text-lg text-muted-foreground">
            Test the QR code generation API with different parameters
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Parameters</CardTitle>
            <CardDescription>
              Test the API using query parameters in the URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="get-url">Value</Label>
                <Input
                  id="get-url"
                  value={getUrl}
                  onChange={(e) => setGetUrl(e.target.value)}
                  placeholder="Text or URL to encode"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="get-size">Size</Label>
                <Input
                  id="get-size"
                  type="number"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  min="64"
                  max="2048"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="get-color-mode">Color Mode</Label>
                <Select
                  value={colorMode}
                  onValueChange={(value) =>
                    setColorMode(value as 'solid' | 'gradient')
                  }
                >
                  <SelectTrigger className="w-full p-2 border rounded-md">
                    <SelectValue placeholder="Select a color mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="get-fg">Foreground Color</Label>
                <Input
                  id="get-fg"
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="get-bg">Background Color</Label>
                <Input
                  id="get-bg"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
              </div>
            </div>

            {colorMode === 'gradient' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="get-gradient-start">Gradient Start</Label>
                  <Input
                    id="get-gradient-start"
                    type="color"
                    value={gradientStart}
                    onChange={(e) => setGradientStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="get-gradient-end">Gradient End</Label>
                  <Input
                    id="get-gradient-end"
                    type="color"
                    value={gradientEnd}
                    onChange={(e) => setGradientEnd(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="get-gradient-direction">Direction</Label>
                  <select
                    id="get-gradient-direction"
                    value={gradientDirection}
                    onChange={(e) => setGradientDirection(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                    <option value="diagonal-down">Diagonal Down</option>
                    <option value="diagonal-up">Diagonal Up</option>
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="get-center-image">Center Image URL</Label>
                <Input
                  id="get-center-image"
                  type="url"
                  value={centerImageUrl}
                  onChange={(e) => setCenterImageUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="get-overlay-bg">Overlay Background</Label>
                <Input
                  id="get-overlay-bg"
                  type="color"
                  value={overlayBackground}
                  onChange={(e) => setOverlayBackground(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="get-overlay-radius">Overlay Radius</Label>
                <Input
                  id="get-overlay-radius"
                  type="number"
                  value={overlayRadius}
                  onChange={(e) => setOverlayRadius(e.target.value)}
                  min="0"
                  max="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="get-overlay-scale">Overlay Scale</Label>
                <Input
                  id="get-overlay-scale"
                  type="number"
                  value={overlayScale}
                  onChange={(e) => setOverlayScale(e.target.value)}
                  min="0.1"
                  max="0.5"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="get-format">Format</Label>
                <Select
                  value={format}
                  onValueChange={(value) =>
                    setFormat(value as 'png' | 'blob' | 'svg')
                  }
                >
                  <SelectTrigger className="w-full p-2 border rounded-md">
                    <SelectValue placeholder="Select a format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="blob">Blob</SelectItem>
                    {svgAvailable && <SelectItem value="svg">SVG</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="get-ecl">Error Correction</Label>
                {/* <select
                  id="get-ecl"
                  value={errorCorrectionLevel}
                  onChange={(e) => setErrorCorrectionLevel(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="L">L (Low)</option>
                  <option value="M">M (Medium)</option>
                  <option value="Q">Q (Quartile)</option>
                  <option value="H">H (High)</option>
                </select> */}
                <Select
                  value={errorCorrectionLevel}
                  onValueChange={setErrorCorrectionLevel}
                >
                  <SelectTrigger className="w-full p-2 border rounded-md">
                    <SelectValue placeholder="Select an error correction level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">L (Low)</SelectItem>
                    <SelectItem value="M">M (Medium)</SelectItem>
                    <SelectItem value="Q">Q (Quartile)</SelectItem>
                    <SelectItem value="H">H (High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="get-margin">Margin</Label>
                <Input
                  id="get-margin"
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  min="0"
                  max="10"
                />
              </div>
            </div>

            <Button
              onClick={() => {
                hasInteractedRef.current = true
                void testGetAPI()
              }}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate QR Code (GET)'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {(result || error) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{error}</p>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  {format === 'svg' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>SVG Output</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result)}
                        >
                          Copy SVG
                        </Button>
                      </div>
                      <div className="border rounded-md p-4 bg-gray-100 dark:bg-gray-800/70 max-h-96 overflow-auto">
                        <pre className="text-sm">{result}</pre>
                      </div>
                    </div>
                  )}

                  {format === 'blob' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Blob (base64) Output</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result)}
                        >
                          Copy Data URL
                        </Button>
                      </div>
                      <div className="border rounded-md p-4 bg-gray-100 dark:bg-gray-800/70 max-h-96 overflow-auto">
                        <pre className="text-xs break-all whitespace-pre-wrap">
                          {result}
                        </pre>
                      </div>
                    </div>
                  )}

                  {format !== 'svg' && format !== 'blob' && (
                    <div>
                      <Label>Generated QR Code</Label>
                      <div className="mt-2 flex justify-center">
                        <img
                          src={result}
                          alt="Generated QR Code"
                          className="border rounded-lg max-w-full"
                        />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = result
                            link.download = 'qr-code.png'
                            link.click()
                          }}
                        >
                          Download PNG
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result)}
                        >
                          Copy Image URL
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* API Documentation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Learn how to use the QR code generation API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">GET /api/qrcode</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Generate QR codes using query parameters
              </p>
              <div className="space-y-2">
                <div className="bg-gray-100 dark:bg-gray-800/70 p-3 rounded text-sm font-mono whitespace-pre-wrap break-words">
                  Basic (solid):
                  <br />
                  GET
                  /api/qrcode?value=Hello%20World&size=320&colorMode=solid&foregroundColor=%23000000&backgroundColor=%23FFFFFF&format=png
                </div>
                <div className="bg-gray-100 dark:bg-gray-800/70 p-3 rounded text-sm font-mono whitespace-pre-wrap break-words">
                  Gradient (PNG):
                  <br />
                  GET
                  /api/qrcode?value=Hello%20Gradient&size=512&colorMode=gradient&gradientStart=%231e40af&gradientEnd=%23ec4899&gradientDirection=diagonal-up&backgroundColor=%23FFFFFF&format=png
                </div>
                <div className="bg-gray-100 dark:bg-gray-800/70 p-3 rounded text-sm font-mono whitespace-pre-wrap break-words">
                  Center image overlay (PNG):
                  <br />
                  GET
                  /api/qrcode?value=With%20Logo&size=400&colorMode=solid&foregroundColor=%23000000&backgroundColor=%23FFFFFF&centerImageUrl=https%3A%2F%2Fexample.com%2Flogo.png&overlayBackground=%23FFFFFF&overlayRadius=12&overlayScale=0.26&format=png
                </div>
                <div className="bg-gray-100 dark:bg-gray-800/70 p-3 rounded text-sm font-mono whitespace-pre-wrap break-words">
                  SVG (no gradient/overlay):
                  <br />
                  GET
                  /api/qrcode?value=SVG%20Solid&size=256&colorMode=solid&foregroundColor=%23000000&backgroundColor=%23FFFFFF&format=svg
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">POST /api/qrcode</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Generate QR codes using JSON body
              </p>
              <div className="space-y-2">
                <div className="bg-gray-100 dark:bg-gray-800/70 p-3 rounded text-sm font-mono whitespace-pre-wrap break-words">
                  Basic (solid):
                  <br />
                  POST /api/qrcode
                  <br />
                  Content-Type: application/json
                  <br />
                  <br />
                  {JSON.stringify(
                    {
                      value: 'Hello World',
                      size: 320,
                      colorMode: 'solid',
                      foregroundColor: '#000000',
                      backgroundColor: '#FFFFFF',
                      format: 'png',
                    },
                    null,
                    2
                  )}
                </div>
                <div className="bg-gray-100 dark:bg-gray-800/70 p-3 rounded text-sm font-mono whitespace-pre-wrap break-words">
                  Gradient (PNG):
                  <br />
                  POST /api/qrcode
                  <br />
                  Content-Type: application/json
                  <br />
                  <br />
                  {JSON.stringify(
                    {
                      value: 'Hello Gradient',
                      size: 512,
                      colorMode: 'gradient',
                      gradientStart: '#1e40af',
                      gradientEnd: '#ec4899',
                      gradientDirection: 'diagonal-up',
                      backgroundColor: '#FFFFFF',
                      format: 'png',
                    },
                    null,
                    2
                  )}
                </div>
                <div className="bg-gray-100 dark:bg-gray-800/70 p-3 rounded text-sm font-mono whitespace-pre-wrap break-words">
                  Center image overlay (PNG):
                  <br />
                  POST /api/qrcode
                  <br />
                  Content-Type: application/json
                  <br />
                  <br />
                  {JSON.stringify(
                    {
                      value: 'With Logo',
                      size: 400,
                      colorMode: 'solid',
                      foregroundColor: '#111827',
                      backgroundColor: '#FFFFFF',
                      centerImageUrl: 'https://example.com/logo.png',
                      overlayBackground: '#FFFFFF',
                      overlayRadius: 12,
                      overlayScale: 0.26,
                      format: 'png',
                    },
                    null,
                    2
                  )}
                </div>
                <div className="bg-gray-100 dark:bg-gray-800/70 p-3 rounded text-sm font-mono whitespace-pre-wrap break-words">
                  SVG (no gradient/overlay):
                  <br />
                  POST /api/qrcode
                  <br />
                  Content-Type: application/json
                  <br />
                  <br />
                  {JSON.stringify(
                    {
                      value: 'SVG Solid',
                      size: 256,
                      colorMode: 'solid',
                      foregroundColor: '#000000',
                      backgroundColor: '#FFFFFF',
                      format: 'svg',
                    },
                    null,
                    2
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Parameters</h3>
              <ul className="text-sm space-y-1">
                <li>
                  <strong>value</strong> (required): Text or URL to encode
                </li>
                <li>
                  <strong>size</strong> (optional): QR code size in pixels
                  (64-2048, default: 320)
                </li>
                <li>
                  <strong>margin</strong> (optional): Margin around QR code
                  (0-10, default: 2)
                </li>
                <li>
                  <strong>errorCorrectionLevel</strong> (optional): L, M, Q, or
                  H (default: H)
                </li>
                <li>
                  <strong>colorMode</strong> (optional): "solid" or "gradient"
                  (default: solid)
                </li>
                <li>
                  <strong>foregroundColor</strong> (optional): QR code color in
                  hex (default: #000000)
                </li>
                <li>
                  <strong>backgroundColor</strong> (optional): Background color
                  in hex (default: #FFFFFF)
                </li>
                <li>
                  <strong>format</strong> (optional): png or svg (default: png)
                </li>
                <li>
                  <strong>gradientStart</strong> (optional): Start color in hex
                  (used when colorMode=gradient)
                </li>
                <li>
                  <strong>gradientEnd</strong> (optional): End color in hex
                  (used when colorMode=gradient)
                </li>
                <li>
                  <strong>gradientDirection</strong> (optional): horizontal |
                  vertical | diagonal-down | diagonal-up (used when
                  colorMode=gradient)
                </li>
                <li>
                  <strong>centerImageUrl</strong> (optional): Public URL of an
                  image to overlay in the center (PNG/JPG/SVG). PNG output only.
                </li>
                <li>
                  <strong>overlayBackground</strong> (optional): Background
                  color behind the center image (hex, default: #FFFFFF). PNG
                  output only.
                </li>
                <li>
                  <strong>overlayRadius</strong> (optional): Rounded corner
                  radius for the overlay background (0-50, default: 8). PNG
                  output only.
                </li>
                <li>
                  <strong>overlayScale</strong> (optional): Relative size of the
                  center image (0.1-0.5, default: 0.24). PNG output only.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
