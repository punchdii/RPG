import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/navigation'

export const metadata: Metadata = {
  title: 'ResumeTree - Transform Your Resume Into an Interactive Skill Tree',
  description: 'Create your professional skill tree with a one-click resume or plain text upload',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navigation />
        {children}
      </body>
    </html>
  )
}
