import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('authToken')
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')

  // If trying to access dashboard without token, redirect to login
  if (isDashboardRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If trying to access login with token, redirect to dashboard
  if (request.nextUrl.pathname === '/login' && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login']
} 