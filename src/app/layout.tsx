import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Watson PowertrainOS',
    template: '%s | PowertrainOS',
  },
  description: 'Fleet workforce & compliance operating system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
