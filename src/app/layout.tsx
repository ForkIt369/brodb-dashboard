import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DashboardLayout from './dashboard-layout'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BRODB Admin Dashboard',
  description: 'Admin dashboard for BRO Telegram play-to-earn platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark-primary`}>
        <ErrorBoundary>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </ErrorBoundary>
      </body>
    </html>
  )
}