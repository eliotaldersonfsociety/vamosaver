import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get('accessToken')?.value; // Accede al valor de la cookie
  const cart = req.cookies.get('cart')?.value; // Accede al valor de la cookie

  console.log('Token:', token); // Verifica si hay token
  console.log('Cart:', cart); // Verifica si hay carrito

  // Rutas protegidas
  const protectedPaths = ['/dashboard', '/payments', '/shopping', '/checkout'];

  // Verifica si la ruta actual es una de las protegidas
  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {

    // Si la ruta es `/checkout`, verificar solo el carrito
    if (req.nextUrl.pathname === '/checkout') {
      // Si no hay carrito o el carrito está vacío
      const parsedCart = cart ? JSON.parse(cart) : [];
      console.log('Parsed Cart:', parsedCart); // Verifica el contenido del carrito
      if (!parsedCart || parsedCart.length === 0) {
        // Si el carrito está vacío, redirigir a la raíz
        console.log('Carrito vacío, redirigiendo a la raíz');
        return NextResponse.redirect(new URL('/', req.url)); // Redirige a la raíz
      }
    }

    // Para otras rutas protegidas, verificar el token
    if (req.nextUrl.pathname !== '/checkout' && !token) {
      console.log('Token no encontrado, redirigiendo a la raíz');
      return NextResponse.redirect(new URL('/', req.url)); // Redirige a la raíz si no hay token
    }

    // Si la ruta es protegida y hay token, se verifica la validez del token
    if (token && req.nextUrl.pathname !== '/checkout') {

      try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET is not defined');
        }
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
        console.log('Decoded token:', payload); // Verifica el contenido del token
        // Continúa la solicitud si el token es válido
        return NextResponse.next();
      } catch (error) {
        console.error('Token inválido o expirado:', error);
        return NextResponse.redirect(new URL('/', req.url)); // Redirige a la raíz si el token es inválido
      }
    }
  }

  // Si no es una ruta protegida, continúa normalmente
  return NextResponse.next();
}

// Configura las rutas protegidas con el `matcher` para que se apliquen solo en las rutas deseadas
export const config = {
  matcher: ['/dashboard', '/payments', '/shopping', '/checkout'], // Especifica las rutas a proteger
};
