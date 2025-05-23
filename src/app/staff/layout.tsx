"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/images/RNIT_Logo.png";
import { motion } from "framer-motion";
import { 
  QrCodeIcon, 
  HomeIcon, 
  UsersIcon, 
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    // Check if it's a protected route
    if (!pathname.includes("/staff/login")) {
      const token = Cookies.get("staffAuthToken");
      if (!token) {
        router.push("/staff/login");
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    Cookies.remove("staffAuthToken");
    Cookies.remove("staffInfo");
    router.push("/staff/login");
  };

  if (!mounted) {
    return null;
  }

  // Don't apply layout to login page
  if (pathname === "/staff/login") {
    return <>{children}</>;
  }

  const navigation = [
    { name: "Dashboard", href: "/staff/dashboard", icon: HomeIcon },
    { name: "Scan Badges", href: "/staff/scan", icon: QrCodeIcon },
    { name: "Attendees", href: "/staff/attendees", icon: UsersIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-0 left-0 right-0 lg:hidden flex items-center justify-between bg-white z-40 border-b p-4">
        <Link href="/staff/dashboard" className="flex items-center gap-2">
          <div className="relative w-8 h-8 bg-white rounded-full p-0.5">
            <Image
              src={logo}
              alt="RNIT Logo"
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="font-bold text-[#000060]">RNIT Staff</span>
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
      <div className="fixed top-0 left-0 bottom-0 w-72 bg-[#000060] shadow-lg z-50 hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-6 border-b border-gray-700">
            <Link href="/staff/dashboard" className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-white rounded-full p-1 shadow-sm">
                <Image
                  src={logo}
                  alt="RNIT Logo"
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-lg">RNIT Staff</span>
                <span className="text-xs text-gray-300">Event Management</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#E1FAFA] text-[#000060] font-medium"
                      : "text-white hover:text-gray-900 hover:bg-[#E1FAFA]"
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-[#000060]" : "text-white"} hover:text-gray-900`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center px-4 py-3 text-white hover:text-gray-900 hover:bg-[#E1FAFA] rounded-lg transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3 text-white" />
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
          <div className="p-6 border-b border-gray-700">
            <Link href="/staff/dashboard" className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-white rounded-full p-1 shadow-sm">
                <Image
                  src={logo}
                  alt="RNIT Logo"
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-lg">RNIT Staff</span>
                <span className="text-xs text-gray-300">Event Management</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#E1FAFA] text-[#000060] font-medium"
                      : "text-white hover:bg-[#00004c]"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-[#000060]" : "text-white"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center px-4 py-3 text-white hover:bg-[#E1FAFA] rounded-lg transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3 text-white" />
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}