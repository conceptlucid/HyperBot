import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HyperBot - Your Personal AI Agent',
  description: 'Control any computer with AI',
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
