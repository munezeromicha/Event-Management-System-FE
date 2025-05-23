import type { Metadata } from 'next'
import { jost, livvic } from './fonts'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'RNIT Event Management',
  description: 'Professional event management platform for investors and journalists',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jost.variable} ${livvic.variable}`}>
      <body>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
                color: '#fff',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
            loading: {
              duration: 2000,
              style: {
                background: '#3B82F6',
                color: '#fff',
              },
            },
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 