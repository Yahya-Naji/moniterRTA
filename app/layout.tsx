import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RTA Dubai · Safety Sentinel',
  description: 'AI for Safety Governance, Certification and Autonomous Mobility Regulation — continuous compliance monitoring for RTA Dubai guided transport systems.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f6f8] text-[#1f2430] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
