"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import logo from "../../../../public/images/RNIT_Logo.png";

interface StaffLoginFormProps {
  onSubmit: (data: {
    username: string;
    password: string;
  }) => void;
  isLoading: boolean;
}

function StaffLoginForm({ onSubmit, isLoading }: StaffLoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <div className="relative rounded-md shadow-sm">
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="appearance-none text-gray-600 block w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007DC2] focus:border-transparent transition-colors"
            placeholder="Enter your staff username"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative rounded-md shadow-sm">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none text-gray-600 block w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007DC2] focus:border-transparent transition-colors pr-10"
            placeholder="Enter your password"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center cursor-pointer py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#000060] hover:bg-[#094BBA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007DC2] transition-colors font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}

export default function StaffLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const token = Cookies.get("staffAuthToken");
    if (token) {
      router.push("/staff/dashboard");
    }
  }, [router]);

  const handleLogin = async (data: {
    username: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      toast.loading("Signing in...", { id: "login" });

      // Use the staff login endpoint
      const response = await fetch("http://localhost:3000/api/staff/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const result = await response.json();

      if (result.token) {
        const cookieOptions = {
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          expires: 1, // 1 day
        };

        Cookies.set("staffAuthToken", result.token, cookieOptions);
        // Store staff info if available
        if (result.staff) {
          Cookies.set("staffInfo", JSON.stringify(result.staff), cookieOptions);
        }
      }

      toast.success("Successfully signed in!", { id: "login" });

      const loginCard = document.getElementById("login-card");
      if (loginCard) {
        loginCard.classList.add("scale-105", "opacity-0");
      }

      setTimeout(() => {
        router.push("/staff/dashboard");
      }, 500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during login";
      toast.error(errorMessage, { id: "login" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Top decorative header */}
      <div className="absolute top-0 left-0 right-0 h-16 md:h-24 bg-[#000060]"></div>

      {/* Side decorative element */}
      <div className="absolute left-0 top-16 md:top-24 bottom-0 w-32 md:w-48 lg:w-64 bg-[#E1FAFA] opacity-70 -skew-x-6 transform origin-top-right"></div>

      {/* Logo header */}
      <div className="relative pt-4 px-6 z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-lg p-1 transition-all duration-300 group-hover:shadow-xl">
            <Image
              src={logo}
              alt="RNIT Logo"
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col text-white">
            <span className="flex items-center md:text-2xl font-bold">
              <span className="font-extrabold">Rwanda National</span>
            </span>
            <span className="text-sm md:text-2xl -mt-1 font-extrabold">
              Investment Trust Ltd
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 z-10 mt-8 lg:mt-0">
        <div
          id="login-card"
          className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E1FAFA] overflow-hidden transition-all duration-500"
        >
          {/* Card header */}
          <div className="bg-[#000060] p-6 text-white">
            <div className="flex items-center mb-4">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <LockClosedIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Staff Login</h2>
                <p className="text-sm text-white/80">
                  Enter your credentials to access the staff dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="p-6 md:p-8">
            <StaffLoginForm onSubmit={handleLogin} isLoading={isLoading} />

            <div className="pt-6 border-t border-[#E1FAFA] mt-6">
              <p className="text-center text-sm text-gray-600">
                Need help? Contact{" "}
                <a
                  href="mailto:info@rnit.rw"
                  className="text-[#000060] font-medium hover:underline"
                >
                  info@rnit.rw
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-sm text-gray-500 mt-auto">
        <p>
          © {new Date().getFullYear()} Rwanda National Investment Trust. All
          rights reserved.
        </p>
      </div>
    </div>
  );
} 