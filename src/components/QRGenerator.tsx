'use client'

import {
  Download,
  Link,
  Mail,
  Palette,
  QrCode,
  Type,
  User,
  X,
} from 'lucide-react'
import QRCode from 'qrcode'
import { useMemo, useRef, useState } from 'react'

import QRCodeCanvas, { QRCodeCanvasRef } from '@/components/QRCodeCanvas'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

export type QrType = 'text' | 'url' | 'email' | 'contact'
export type GradientDirection =
  | 'horizontal'
  | 'vertical'
  | 'diagonal-down'
  | 'diagonal-up'

type EmailData = { email: string; subject: string; body: string }

type ContactData = {
  firstName: string
  lastName: string
  phone: string
  email: string
  organization: string
}

const CANVAS_SIZE = 320

const colorPresets = {
  solid: [
    { name: 'Classic Black', fg: '#000000', bg: '#FFFFFF' },
    { name: 'Navy Blue', fg: '#1e3a8a', bg: '#FFFFFF' },
    { name: 'Forest Green', fg: '#166534', bg: '#FFFFFF' },
    { name: 'Deep Purple', fg: '#6b21a8', bg: '#FFFFFF' },
    { name: 'Crimson Red', fg: '#dc2626', bg: '#FFFFFF' },
  ],
  gradient: [
    {
      name: 'Burgundy Rose',
      start: '#8B5A3C',
      end: '#F8BBD9',
      direction: 'diagonal-down' as const,
    },
    {
      name: 'Ocean Blue',
      start: '#1e40af',
      end: '#06b6d4',
      direction: 'diagonal-down' as const,
    },
    {
      name: 'Sunset Orange',
      start: '#ea580c',
      end: '#fbbf24',
      direction: 'horizontal' as const,
    },
    {
      name: 'Forest Mint',
      start: '#166534',
      end: '#10b981',
      direction: 'vertical' as const,
    },
    {
      name: 'Purple Dream',
      start: '#7c3aed',
      end: '#ec4899',
      direction: 'diagonal-up' as const,
    },
  ],
}

export default function QRGenerator() {
  const [qrType, setQrType] = useState<QrType>('text')
  const [textData, setTextData] = useState('Welcome to QR Generator!')
  const [urlData, setUrlData] = useState('')
  const [emailData, setEmailData] = useState<EmailData>({
    email: '',
    subject: '',
    body: '',
  })
  const [contactData, setContactData] = useState<ContactData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
  })

  const [centerImage, setCenterImage] = useState<File | null>(null)

  const [colorMode, setColorMode] = useState<'solid' | 'gradient' | 'preset'>(
    'solid'
  )
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [gradientStart, setGradientStart] = useState('#8B5A3C')
  const [gradientEnd, setGradientEnd] = useState('#F8BBD9')
  const [gradientDirection, setGradientDirection] =
    useState<GradientDirection>('diagonal-down')
  const [selectedPreset, setSelectedPreset] = useState('burgundy-rose')

  const qrCanvasRef = useRef<QRCodeCanvasRef | null>(null)
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZE)
  const [downloadOpen, setDownloadOpen] = useState(false)

  const content = useMemo(() => {
    if (qrType === 'text') return textData.trim()
    if (qrType === 'url') {
      const trimmed = urlData.trim()
      if (!trimmed) return ''
      if (/^https?:\/\//i.test(trimmed)) return trimmed
      return `https://${trimmed}`
    }
    if (qrType === 'email') {
      const email = emailData.email.trim()
      if (!email) return ''
      const params = new URLSearchParams()
      if (emailData.subject.trim())
        params.set('subject', emailData.subject.trim())
      if (emailData.body.trim()) params.set('body', emailData.body.trim())
      const query = params.toString()
      return query ? `mailto:${email}?${query}` : `mailto:${email}`
    }
    const firstName = contactData.firstName.trim()
    const lastName = contactData.lastName.trim()
    const phone = contactData.phone.trim()
    const email = contactData.email.trim()
    const organization = contactData.organization.trim()
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
  }, [qrType, textData, urlData, emailData, contactData])

  const isGradientActive = useMemo(() => {
    if (colorMode === 'gradient') return true
    if (colorMode === 'preset') {
      return colorPresets.gradient.some(
        (p) => p.name.toLowerCase().replace(' ', '-') === selectedPreset
      )
    }
    return false
  }, [colorMode, selectedPreset])

  const effectiveColors = useMemo(() => {
    if (colorMode === 'preset') {
      const solidPreset = colorPresets.solid.find(
        (p) => p.name.toLowerCase().replace(' ', '-') === selectedPreset
      )
      if (solidPreset) {
        return { dark: solidPreset.fg, light: solidPreset.bg }
      }
      return { dark: '#000000', light: backgroundColor }
    }
    return { dark: foregroundColor, light: backgroundColor }
  }, [colorMode, selectedPreset, foregroundColor, backgroundColor])

  const applyPreset = (presetName: string) => {
    setSelectedPreset(presetName)
    const solid = colorPresets.solid.find(
      (p) => p.name.toLowerCase().replace(' ', '-') === presetName
    )
    const grad = colorPresets.gradient.find(
      (p) => p.name.toLowerCase().replace(' ', '-') === presetName
    )
    if (solid) {
      setForegroundColor(solid.fg)
      setBackgroundColor(solid.bg)
    }
    if (grad) {
      setGradientStart(grad.start)
      setGradientEnd(grad.end)
      setGradientDirection(grad.direction)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setCenterImage(file)
  }

  const handleDownload = async (format: 'png' | 'svg') => {
    setDownloadOpen(false)
    if (format === 'png') {
      const canvas = qrCanvasRef.current
      if (!canvas) return
      const link = document.createElement('a')
      link.download = 'qr-code.png'
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }
    // SVG (solid colors only)
    const svg = await QRCode.toString(content, {
      type: 'svg',
      width: canvasSize,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: effectiveColors.dark,
        light: effectiveColors.light,
      },
    })
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'qr-code.svg'
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <QrCode className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              QR Code Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Create custom QR codes for text, links, emails, contacts, and more
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Preview
              </CardTitle>
              <CardDescription>
                Your generated QR code will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <QRCodeCanvas
                  ref={qrCanvasRef}
                  value={content}
                  size={canvasSize}
                  colorMode={isGradientActive ? 'gradient' : 'solid'}
                  //overlayBackground="transparent"
                  foregroundColor={effectiveColors.dark}
                  backgroundColor={effectiveColors.light}
                  gradientStart={gradientStart}
                  gradientEnd={gradientEnd}
                  gradientDirection={gradientDirection}
                  centerImageFile={centerImage}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white max-w-full"
                  style={{
                    width: '100%',
                    maxWidth: canvasSize,
                    height: 'auto',
                  }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <Label className="text-sm font-medium">Color Options</Label>
                </div>

                <Tabs
                  value={colorMode}
                  onValueChange={(value) =>
                    setColorMode(value as 'solid' | 'gradient' | 'preset')
                  }
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="solid">Solid</TabsTrigger>
                    <TabsTrigger value="gradient">Gradient</TabsTrigger>
                    <TabsTrigger value="preset">Presets</TabsTrigger>
                  </TabsList>

                  <TabsContent value="solid" className="space-y-3 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="fg-color" className="text-xs">
                          Foreground
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="fg-color"
                            type="color"
                            value={foregroundColor}
                            onChange={(e) => setForegroundColor(e.target.value)}
                            className="w-12 h-8 p-1 border rounded"
                          />
                          <Input
                            type="text"
                            value={foregroundColor}
                            onChange={(e) => setForegroundColor(e.target.value)}
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bg-color" className="text-xs">
                          Background
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="bg-color"
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-12 h-8 p-1 border rounded"
                          />
                          <Input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="gradient" className="space-y-3 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="gradient-start" className="text-xs">
                          Start Color
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="gradient-start"
                            type="color"
                            value={gradientStart}
                            onChange={(e) => setGradientStart(e.target.value)}
                            className="w-12 h-8 p-1 border rounded"
                          />
                          <Input
                            type="text"
                            value={gradientStart}
                            onChange={(e) => setGradientStart(e.target.value)}
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gradient-end" className="text-xs">
                          End Color
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="gradient-end"
                            type="color"
                            value={gradientEnd}
                            onChange={(e) => setGradientEnd(e.target.value)}
                            className="w-12 h-8 p-1 border rounded"
                          />
                          <Input
                            type="text"
                            value={gradientEnd}
                            onChange={(e) => setGradientEnd(e.target.value)}
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Direction</Label>
                      <Select
                        value={gradientDirection}
                        onValueChange={(value) =>
                          setGradientDirection(value as GradientDirection)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="horizontal">
                            Horizontal →
                          </SelectItem>
                          <SelectItem value="vertical">Vertical ↓</SelectItem>
                          <SelectItem value="diagonal-down">
                            Diagonal ↘
                          </SelectItem>
                          <SelectItem value="diagonal-up">
                            Diagonal ↗
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="preset" className="space-y-3 mt-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium">
                          Solid Colors
                        </Label>
                        <div className="grid grid-cols-1 gap-1 mt-2">
                          {colorPresets.solid.map((preset) => (
                            <Button
                              key={preset.name}
                              variant={
                                selectedPreset ===
                                preset.name.toLowerCase().replace(' ', '-')
                                  ? 'default'
                                  : 'outline'
                              }
                              size="sm"
                              onClick={() =>
                                applyPreset(
                                  preset.name.toLowerCase().replace(' ', '-')
                                )
                              }
                              className="justify-start h-8 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded border"
                                  style={{ backgroundColor: preset.fg }}
                                />
                                {preset.name}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Gradients</Label>
                        <div className="grid grid-cols-1 gap-1 mt-2">
                          {colorPresets.gradient.map((preset) => (
                            <Button
                              key={preset.name}
                              variant={
                                selectedPreset ===
                                preset.name.toLowerCase().replace(' ', '-')
                                  ? 'default'
                                  : 'outline'
                              }
                              size="sm"
                              onClick={() =>
                                applyPreset(
                                  preset.name.toLowerCase().replace(' ', '-')
                                )
                              }
                              className="justify-start h-8 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded border"
                                  style={{
                                    background: `linear-gradient(45deg, ${preset.start}, ${preset.end})`,
                                  }}
                                />
                                {preset.name}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="center-image" className="text-sm font-medium">
                  Center Image (Optional)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="center-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                  {centerImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCenterImage(null)
                        const fileInput = document.getElementById(
                          'center-image'
                        ) as HTMLInputElement | null
                        if (fileInput) fileInput.value = ''
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {centerImage && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ {centerImage.name} uploaded
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCanvasSize((s) =>
                      s > CANVAS_SIZE
                        ? CANVAS_SIZE
                        : Math.min(1024, CANVAS_SIZE * 2)
                    )
                  }
                >
                  {canvasSize > CANVAS_SIZE ? 'Shrink' : 'Enlarge'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDownloadOpen((o) => !o)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {downloadOpen && (
                  <Select
                    onValueChange={(v) =>
                      void handleDownload(v as 'png' | 'svg')
                    }
                  >
                    <SelectTrigger className="h-8 w-[140px]">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Code Content</CardTitle>
              <CardDescription>
                Choose what type of content your QR code should contain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={qrType}
                onValueChange={(v) => setQrType(v as QrType)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="text" className="flex items-center gap-1">
                    <Type className="h-4 w-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-1">
                    <Link className="h-4 w-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger
                    value="email"
                    className="flex items-center gap-1"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className="flex items-center gap-1"
                  >
                    <User className="h-4 w-4" />
                    Contact
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="text-content">Text Content</Label>
                    <Textarea
                      id="text-content"
                      placeholder="Enter any text you want to encode in the QR code..."
                      value={textData}
                      onChange={(e) => setTextData(e.target.value)}
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="url-input">Website URL</Label>
                    <Input
                      id="url-input"
                      type="url"
                      placeholder="https://example.com"
                      value={urlData}
                      onChange={(e) => setUrlData(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input
                      id="email-address"
                      type="email"
                      placeholder="recipient@example.com"
                      value={emailData.email}
                      onChange={(e) =>
                        setEmailData({ ...emailData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Subject (Optional)</Label>
                    <Input
                      id="email-subject"
                      placeholder="Email subject"
                      value={emailData.subject}
                      onChange={(e) =>
                        setEmailData({ ...emailData, subject: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-body">Message (Optional)</Label>
                    <Textarea
                      id="email-body"
                      placeholder="Email message..."
                      value={emailData.body}
                      onChange={(e) =>
                        setEmailData({ ...emailData, body: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        placeholder="John"
                        value={contactData.firstName}
                        onChange={(e) =>
                          setContactData({
                            ...contactData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        placeholder="Doe"
                        value={contactData.lastName}
                        onChange={(e) =>
                          setContactData({
                            ...contactData,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Phone Number</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={contactData.phone}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email Address</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={contactData.email}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">
                      Organization (Optional)
                    </Label>
                    <Input
                      id="organization"
                      placeholder="Company Name"
                      value={contactData.organization}
                      onChange={(e) =>
                        setContactData({
                          ...contactData,
                          organization: e.target.value,
                        })
                      }
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
