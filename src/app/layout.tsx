import type { Metadata } from 'next'
import { Montserrat, DM_Sans } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: '.elsewhere',
    template: '%s — .elsewhere',
  },
  description: 'Cultural + Narrative Design',
  icons: {
    icon: '/icon.jpeg',
    shortcut: '/icon.jpeg',
    apple: '/apple-icon.jpeg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${montserrat.variable} ${dmSans.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
