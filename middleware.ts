import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define which paths require authentication
const protectedPaths = ["/dashboard"]

// Define which paths are accessible only to non-authenticated users
const authPaths = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some((path) => currentPath === path || currentPath.startsWith(`${path}/`))

  // Check if the path is for non-authenticated users only
  const isAuthPath = authPaths.some((path) => currentPath === path || currentPath.startsWith(`${path}/`))

  // Get the authentication token from the cookies
  const authToken = request.cookies.get("auth_token")?.value

  // Get the session from cookies
  const sessionCookie = request.cookies.get("session")?.value
  const session = sessionCookie ? JSON.parse(sessionCookie) : null

  // Check if user is authenticated - both token and session must exist
  const isAuthenticated = authToken && session && session.isAuthenticated === true

  // For debugging - log authentication state (remove in production)
  console.log("Middleware check:", {
    path: currentPath,
    isProtectedPath,
    isAuthPath,
    hasAuthToken: !!authToken,
    hasSession: !!session,
    isAuthenticated,
  })

  // If the path requires authentication and user is not authenticated, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL("/login", request.url)
    url.searchParams.set("from", currentPath)
    return NextResponse.redirect(url)
  }

  // If the path is for non-authenticated users and user is authenticated, redirect to dashboard
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // For all other cases, continue with the request
  return NextResponse.next()
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml, /robots.txt (static files)
     */
    "/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
