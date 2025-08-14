'use client'

import {
  Download,
  ImageIcon,
  Link,
  Mail,
  QrCode,
  Type,
  Upload,
  User,
} from 'lucide-react'
import { useState, type ChangeEvent } from 'react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

export default function QRGenerator() {
  const [qrType, setQrType] = useState('text')
  const [centerImage, setCenterImage] = useState<File | null>(null)

  // Form states for different QR types
  const [textData, setTextData] = useState('')
  const [urlData, setUrlData] = useState('')
  const [emailData, setEmailData] = useState({
    email: '',
    subject: '',
    body: '',
  })
  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
  })

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCenterImage(file)
    }
  }

  const generateQR = () => {
    // This would integrate with a QR code library
    console.log('Generating QR code for:', qrType)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
          {/* Left Panel - QR Code Preview */}
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
              {/* QR Code Placeholder */}
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src="/qr-code-placeholder.png"
                    alt="QR Code Preview"
                    className="w-70 h-70 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                  {centerImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Center Image Upload */}
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
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {centerImage && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ {centerImage.name} uploaded
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={generateQR} className="flex-1">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - QR Code Options */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Content</CardTitle>
              <CardDescription>
                Choose what type of content your QR code should contain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={qrType} onValueChange={setQrType} className="w-full">
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

                {/* Text Tab */}
                <TabsContent value="text" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="text-content">Text Content</Label>
                    <Textarea
                      id="text-content"
                      placeholder="Enter any text you want to encode in the QR code..."
                      value={textData}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        setTextData(e.target.value)
                      }
                      rows={4}
                    />
                  </div>
                </TabsContent>

                {/* URL Tab */}
                <TabsContent value="url" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="url-input">Website URL</Label>
                    <Input
                      id="url-input"
                      type="url"
                      placeholder="https://example.com"
                      value={urlData}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setUrlData(e.target.value)
                      }
                    />
                  </div>
                </TabsContent>

                {/* Email Tab */}
                <TabsContent value="email" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input
                      id="email-address"
                      type="email"
                      placeholder="recipient@example.com"
                      value={emailData.email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        setEmailData({ ...emailData, body: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact" className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        placeholder="John"
                        value={contactData.firstName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
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

