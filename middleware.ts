import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check for protected routes that require authentication
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/account") || request.nextUrl.pathname.startsWith("/checkout")

  if (isProtectedRoute) {
    // Get the token from the cookie
    const accessToken = request.cookies.get("accessToken")?.value

    if (!accessToken) {
      // Redirect to login if no token is found
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("from", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // Verify the token (in a real app, you'd use the JWT_SECRET from env)
      // This is just a basic check, the actual verification happens in the API
      if (!accessToken.includes(".")) {
        throw new Error("Invalid token format")
      }

      // If token is valid, continue to the protected route
      return NextResponse.next()
    } catch (error) {
      // If token is invalid, redirect to login
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("from", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // For non-protected routes, continue normally
  return NextResponse.next()
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ["/account/:path*", "/dshboard/:path*"],
}

