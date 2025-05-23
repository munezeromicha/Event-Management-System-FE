'use client'

import { ReactNode, useState, useEffect } from 'react'
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
  QrCodeIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import Image from 'next/image'
import logo from '../../../public/images/RNIT_Logo.png'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Scan QR', href: '/dashboard/scan-qr', icon: QrCodeIcon },
  { name: 'Events', href: '/dashboard/event', icon: CalendarIcon },
  { name: 'Registrations', href: '/dashboard/registrations', icon: ClipboardDocumentListIcon },
  { name: 'Attendees', href: '/dashboard/attendees', icon: UsersIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    // Clear the auth token
    Cookies.remove('authToken')
    // Show success message
    toast.success('Successfully logged out')
    // Redirect to login page
    router.push('/login')
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-0 left-0 right-0 lg:hidden flex items-center justify-between bg-white z-40 border-b p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative w-8 h-8 bg-white rounded-full p-0.5">
            <Image
              src={logo}
              alt="RNIT Logo"
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="font-bold text-[#000060]">RNIT Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-[#000060] hover:bg-gray-100 rounded-lg"
        >
          {sidebarOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Desktop Sidebar - Always visible on large screens */}
      <div className="fixed top-0 left-0 bottom-0 w-64 bg-[#000060] shadow-lg z-50 hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="relative w-14 h-14 bg-white rounded-full p-0.5">
                <Image
                  src={logo}
                  alt="RNIT Logo"
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="font-bold text-white text-xl">RNIT Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 mt-5">
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
                        ? 'bg-[#E1FAFA] text-gray-900'
                        : 'text-gray-300 hover:bg-[#E1FAFA] hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 h-6 w-6
                        ${isActive
                          ? 'text-gray-900'
                          : 'text-white group-hover:text-gray-900'
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

          {/* Logout button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full group cursor-pointer flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-[#E1FAFA] hover:text-gray-900 rounded-lg"
            >
              <ArrowLeftOnRectangleIcon
                className="mr-3 h-6 w-6 text-white group-hover:text-gray-900"
                aria-hidden="true"
              />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Only visible when sidebarOpen is true */}
      <motion.div
        className="fixed top-0 left-0 bottom-0 w-64 bg-[#000060] shadow-lg z-50 lg:hidden"
        animate={{
          translateX: sidebarOpen ? 0 : "-100%"
        }}
        initial={{ translateX: "-100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="relative w-14 h-14 bg-white rounded-full p-0.5">
                <Image
                  src={logo}
                  alt="RNIT Logo"
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="font-bold text-white text-xl">RNIT Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 mt-5">
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
                        ? 'bg-[#E1FAFA] text-gray-900'
                        : 'text-gray-300 hover:bg-[#E1FAFA] hover:text-gray-900'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`
                        mr-3 h-6 w-6
                        ${isActive
                          ? 'text-gray-900'
                          : 'text-white group-hover:text-gray-900'
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

          {/* Logout button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full group cursor-pointer flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-[#E1FAFA] hover:text-gray-900 rounded-lg"
            >
              <ArrowLeftOnRectangleIcon
                className="mr-3 h-6 w-6 text-white group-hover:text-gray-900"
                aria-hidden="true"
              />
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 