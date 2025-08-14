import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

import QRGenerator from '@/components/QRGenerator'
import { Button } from '@/components/ui/button'

export default function Page() {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            QR Code Generator
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          Create custom QR codes for text, links, emails, contacts, and more
        </p>
        <Link href="/api-test">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Test API Endpoint
          </Button>
        </Link>
      </div>
      <QRGenerator />
    </div>
  )
}
