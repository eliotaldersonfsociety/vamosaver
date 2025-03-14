import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  console.log("Todas las cookies disponibles:", req.cookies.getAll()); // 👀 Verifica qué cookies están llegando

  const accessToken = req.cookies.get("accessToken")?.value;
  console.log("Middleware - Token de sesión:", accessToken); // 📌 Debería mostrar el token

  const isAuthRoute = req.nextUrl.pathname.startsWith("/login");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");

  if (!accessToken && isProtectedRoute) {
    console.log("Middleware - No hay token, redirigiendo a /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (accessToken && isAuthRoute) {
    console.log("Middleware - Usuario autenticado, redirigiendo a /dashboard");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
