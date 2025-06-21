import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Lexend_Deca } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context'

const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  display: 'swap',
})

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
      <body className={`min-h-screen bg-slate-900 bg-[url('/Background.png')] bg-cover bg-center bg-no-repeat ${lexendDeca.className}`}>
        <AuthProvider>
          <Navigation />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
