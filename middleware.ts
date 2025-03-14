import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value; // Obtener el accessToken de las cookies
  
  console.log("AccessToken en middleware:", accessToken); // Verifica si el token está llegando
  
  // Si el usuario intenta acceder a /dashboard y no tiene un accessToken
  if (!accessToken && req.nextUrl.pathname.startsWith("/dashboard")) {
    console.log("Redirigiendo a / porque no hay token.");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Si el usuario ya está logueado y trata de acceder a /login, redirigir al dashboard
  if (accessToken && req.nextUrl.pathname.startsWith("/login")) {
    console.log("Redirigiendo a /dashboard porque ya está logueado.");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next(); // Si todo está bien, permite el acceso
}

export const config = {
  matcher: ["/dashboard/:path*", "/"],
};
