export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `https://qr-generator.dev/sitemap.xml`,
  }
}
