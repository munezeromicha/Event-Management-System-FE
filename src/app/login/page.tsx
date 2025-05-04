"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import Link from "next/link";
import {
  LockClosedIcon,
  CalendarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import logo from "../../../public/images/RNIT_Logo.png";
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const token = Cookies.get("authToken");
    if (token) {
      router.push("/dashboard");
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (typeof window !== "undefined") {
        const blob = document.getElementById("blob");
        if (blob) {
          const x = e.clientX - window.innerWidth / 2;
          const y = e.clientY - window.innerHeight / 2;

          blob.animate(
            {
              transform: `translate(${x * 0.05}px, ${y * 0.05}px)`,
            },
            { duration: 3000, fill: "forwards" }
          );
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
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
          expires: data.rememberMe ? 7 : undefined,
        };

        Cookies.set("authToken", result.token, cookieOptions);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col relative overflow-hidden">
      <div
        id="blob"
        className="absolute w-96 h-96 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full filter blur-3xl opacity-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
      ></div>

      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none"></div>

      <div className="absolute top-0 left-0 p-6 z-10">
        <Link
          href="/"
          className="text-3xl cursor-pointer font-bold text-white hover:text-blue-200 transition-colors flex items-center gap-2 group"
        >
          <div className="bg-white bg-opacity-20 p-2 rounded-lg group-hover:bg-opacity-30 transition-all duration-300">
            <Image src={logo} alt="RNIT Logo" className="w-16 h-16" />
          </div>
          <span className="flex items-baseline">
            <span className="font-extrabold">RNIT</span>
            <span className="ml-2 font-light">Events</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <div
          id="login-card"
          className="max-w-md w-full space-y-8 bg-white bg-opacity-95 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white border-opacity-20 transition-all duration-500 animate-fadeIn"
        >
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg mb-4 transform transition-transform hover:rotate-12">
              <LockClosedIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-800">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-center text-gray-600">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

          <div className="pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Need help? Contact{" "}
              <a
                href="mailto:info@rnit.rw"
                className="text-blue-600 hover:underline"
              >
                info@rnit.rw
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-black bg-opacity-30 backdrop-blur-sm z-10">
        <div className="flex items-center text-white space-x-3 transition-all duration-300 hover:bg-gray-900 hover:bg-opacity-10 p-3 rounded-lg">
          <UserGroupIcon className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Event Management</h3>
            <p className="text-xs text-gray-300">
              Manage attendees and registrations
            </p>
          </div>
        </div>
        <div className="flex items-center text-white space-x-3 transition-all duration-300 hover:bg-gray-900 hover:bg-opacity-10 p-3 rounded-lg">
          <CalendarIcon className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Schedule Events</h3>
            <p className="text-xs text-gray-300">
              Create and organize event schedules
            </p>
          </div>
        </div>
        <div className="flex items-center text-white space-x-3 transition-all duration-300 hover:bg-gray-900 hover:bg-opacity-10 p-3 rounded-lg">
          <ShieldCheckIcon className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Secure Access</h3>
            <p className="text-xs text-gray-300">
              Role-based permissions and security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
