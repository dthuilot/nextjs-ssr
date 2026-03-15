import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hello World - NextJS SSR',
  description: 'A Next.js SSR application deployed on AWS Lambda + CloudFront',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: '2rem' }}>
        {children}
      </body>
    </html>
  )
}
