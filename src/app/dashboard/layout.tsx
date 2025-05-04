'use client'

import { ReactNode } from 'react'
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Scan QR', href: '/dashboard/scan-qr', icon: QrCodeIcon },
  { name: 'Events', href: '/dashboard/event', icon: CalendarIcon },
  { name: 'Registrations', href: '/dashboard/registrations', icon: ClipboardDocumentListIcon },
  { name: 'Attendees', href: '/dashboard/attendees', icon: UsersIcon },
  // { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    // Clear the auth token
    Cookies.remove('authToken')
    // Show success message
    toast.success('Successfully logged out')
    // Redirect to login page
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
        <div className="flex h-16 items-center justify-center">
          <Link href="/dashboard" className="text-white text-xl font-bold">
            RNIT Events
          </Link>
        </div>
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-6 w-6
                      ${isActive
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-gray-300'
                      }
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
        <div className="absolute bottom-0 w-full pb-4">
          <button
            onClick={handleLogout}
            className="w-full group flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <ArrowLeftOnRectangleIcon
              className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-300"
              aria-hidden="true"
            />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 