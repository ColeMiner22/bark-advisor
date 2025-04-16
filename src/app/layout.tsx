import type { Metadata } from 'next'
import { Inter, Poppins, Fredoka } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
})
const fredoka = Fredoka({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-fredoka'
})

export const metadata: Metadata = {
  title: 'Bark Advisor - Your Furry Friend\'s Guide',
  description: 'Find the perfect products and advice for your beloved dog',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${fredoka.variable} font-sans bg-gradient-to-b from-orange-50 to-white min-h-screen`}>
        <div className="paw-pattern">
          <Navbar />
          <main className="relative">{children}</main>
        </div>
      </body>
    </html>
  )
} 