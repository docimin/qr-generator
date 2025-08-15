import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'

import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system">
          <header className="flex items-center px-4 py-4">
            <Link href="/" className="text-sm font-medium hover:underline">
              Home
            </Link>
            <div className="flex-1 text-center">
              <div className="text-sm text-muted-foreground">
                Made with ❤️ by{' '}
                <Link
                  href="https://fayevr.dev"
                  className="underline"
                  target="_blank"
                >
                  Faye
                </Link>{' '}
                - EU Hosted
              </div>
            </div>
            <ThemeToggle />
          </header>
          <Separator className="" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
