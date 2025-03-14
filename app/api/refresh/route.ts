import { NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  const cookieStore = await cookies(); // Asegurar que es una promesa resuelta
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: 'Refresh token no proporcionado' },
      { status: 400 }
    );
  }

  try {
    // Verificar el refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: number };

    // Buscar el usuario en la base de datos
    const user = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ? AND refresh_token = ?',
      args: [decoded.userId, refreshToken],
    });

    if (user.rows.length === 0) {
      return NextResponse.json(
        { message: 'Refresh token inválido' },
        { status: 400 }
      );
    }

    // Generar un nuevo token de acceso
    const accessToken = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email },
      JWT_SECRET,
      { expiresIn: '15m' } // Token de acceso expira en 15 minutos
    );

    // Crear una respuesta con el nuevo token de acceso
    const response = NextResponse.json(
      { message: 'Token renovado exitosamente', accessToken },
      { status: 200 }
    );

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutos
      path: '/',
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Error al renovar el token' },
      { status: 500 }
    );
  }
}
