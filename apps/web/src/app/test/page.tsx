'use client'

import { fetchQrcodeFromApi } from '@fayevr/qr-code/browser'
import { useState } from 'react'

export default function TestPage() {
  const [value, setValue] = useState('Hello from Test Page')
  const [apiUrl, setApiUrl] = useState('')
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchQrcodeFromApi(undefined, {
        value,
        size: 320,
        margin: 2,
        errorCorrectionLevel: 'H',
        colorMode: 'gradient',
        foregroundColor: '#000000',
        backgroundColor: '#ffffff',
        gradientStart: '#204529',
        gradientEnd: '#89c4a1',
        gradientDirection: 'horizontal',
        format: 'png',
      })
      setImgSrc(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        Test QR Page
      </h1>
      <p style={{ marginBottom: 12 }}>
        This page uses the local package <code>@fayevr/qr-code/browser</code> to
        call the server endpoint and render a PNG QR.
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter text or URL to encode"
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
        />
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="API URL (optional) e.g. https://qr-generator.dev/api/qrcode"
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => void handleGenerate()}
            disabled={loading}
            style={{ padding: '8px 12px' }}
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </div>
      {error && (
        <p style={{ color: 'crimson', marginBottom: 12 }}>Error: {error}</p>
      )}
      {imgSrc ? (
        <img
          src={imgSrc}
          alt="Generated QR"
          style={{
            width: 320,
            height: 320,
            border: '1px solid #ddd',
            borderRadius: 8,
          }}
        />
      ) : (
        <div
          style={{
            width: 320,
            height: 320,
            border: '1px dashed #bbb',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#777',
          }}
        >
          Preview will appear here
        </div>
      )}
    </div>
  )
}
