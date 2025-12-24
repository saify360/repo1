import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '3AM - Creator Monetization Platform',
  description: 'Earn, monetize, and grow your story',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
