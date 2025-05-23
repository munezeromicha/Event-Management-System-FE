"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import logo from "../../../public/images/RNIT_Logo.png";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Check if user is already logged in with admin authToken
    const token = Cookies.get("authToken");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (data: {
    username: string;
    password: string;
    rememberMe: boolean;
  }) => {
    try {
      setIsLoading(true);
      toast.loading("Signing in...", { id: "login" });

      const response = await fetch("http://localhost:3000/api/auth/login", {
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
          expires: data.rememberMe ? 7 : undefined, // 7 days if remember me is checked
        };

        // Store token in cookies as "authToken" (for admin users)
        Cookies.set("authToken", result.token, cookieOptions);
        
        // No need to use localStorage - we're only using cookies
      }

      toast.success("Successfully signed in!", { id: "login" });

      const loginCard = document.getElementById("login-card");
      if (loginCard) {
        loginCard.classList.add("scale-105", "opacity-0");
      }

      setTimeout(() => {
        router.push("/dashboard");
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
                <h2 className="text-2xl font-bold">Admin Login</h2>
                <p className="text-sm text-white/80">
                  Enter your credentials to access the dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="p-6 md:p-8">
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

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
