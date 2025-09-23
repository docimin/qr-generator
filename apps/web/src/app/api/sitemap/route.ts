import { NextResponse } from 'next/server'

// Helper function to escape XML special characters
function escapeXml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Helper function to ensure valid date format
function formatDate(date: string | Date): string {
  if (!date) return new Date().toISOString()
  return new Date(date).toISOString()
}

// Define interfaces for our mappings
interface BaseMapping {
  url: string
  lastModified: string | Date
  changeFrequency: string
  priority: number
  slug: string
  lang: string
  alternates?: Array<{ lang: string; url: string }>
}

interface NewsMapping extends BaseMapping {
  news: {
    publication: {
      name: string
      language: string
    }
    publication_date: string | Date
    title: string
  }
}

type MappingType = BaseMapping | NewsMapping

export function GET() {
  try {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
          xmlns:xhtml="http://www.w3.org/1999/xhtml">
  `

    const mappings: MappingType[] = [
      {
        url: `https://qr-generator.dev`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'yearly',
        priority: 1,
        slug: 'home',
        lang: 'en',
        alternates: [],
      },
    ]

    for (const mapping of mappings) {
      sitemap += '  <url>\n'
      sitemap += `    <loc>${escapeXml(mapping.url)}</loc>\n`

      // Add alternate language links if available
      if (mapping.alternates && mapping.alternates.length > 1) {
        // Use default locale as x-default
        const defaultVersion = mapping.alternates.find(
          (alt) => alt.lang === 'en'
        )

        if (defaultVersion) {
          sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(defaultVersion.url)}"/>\n`
        }

        // Add all language versions - each URL is a valid canonical URL
        for (const alternate of mapping.alternates) {
          sitemap += `    <xhtml:link rel="alternate" hreflang="${alternate.lang}" href="${escapeXml(alternate.url)}"/>\n`
        }
      }

      sitemap += `    <lastmod>${formatDate(mapping.lastModified)}</lastmod>\n`
      sitemap += `    <changefreq>${escapeXml(mapping.changeFrequency)}</changefreq>\n`
      sitemap += `    <priority>${mapping.priority}</priority>\n`
      sitemap += '  </url>\n'
    }

    sitemap += '</urlset>'

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(error.message, { status: 500 })
    }

    return NextResponse.json('Internal server error', { status: 500 })
  }
}
