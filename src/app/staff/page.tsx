"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function StaffIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated as staff
    const staffToken = Cookies.get("staffAuthToken");
    
    if (staffToken) {
      // If authenticated, redirect to dashboard
      router.push("/staff/dashboard");
    } else {
      // If not authenticated, redirect to login
      router.push("/staff/login");
    }
  }, [router]);

  // Show a minimal loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F8FA]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#000060] mx-auto mb-4"></div>
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
} 