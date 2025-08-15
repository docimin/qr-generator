import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'

import type { Metadata } from 'next'

import { Separator } from '@/components/ui/separator'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'QR Generator',
  description: 'Generate QR codes for everything',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="text-center py-4 text-sm text-gray-600">
          Made with ❤️ by{' '}
          <Link href="https://fayevr.dev" className="underline" target="_blank">
            Faye
          </Link>{' '}
          - EU Hosted
        </header>
        <Separator className="mb-4" />
        {children}
      </body>
    </html>
  )
}
