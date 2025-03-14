import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies(); // Asegurar que obtenemos el objeto cookies
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: 'No se proporcionó un refresh token' },
      { status: 400 }
    );
  }

  try {
    // Invalidar el refresh token en la base de datos
    await db.execute({
      sql: 'UPDATE users SET refresh_token = NULL WHERE refresh_token = ?',
      args: [refreshToken],
    });

    // Crear una respuesta para eliminar las cookies
    const response = NextResponse.json(
      { message: 'Sesión cerrada exitosamente' },
      { status: 200 }
    );

    // Eliminar las cookies del cliente
    response.cookies.set('accessToken', '', { maxAge: 0 });
    response.cookies.set('refreshToken', '', { maxAge: 0 });

    return response;
  } catch (error) {
    console.error('Error en el endpoint de logout:', error);
    return NextResponse.json(
      { message: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
