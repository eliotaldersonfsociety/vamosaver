import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  const cookieStore = await cookies(); // 🔹 Agrega await aquí
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Token de acceso no proporcionado' },
      { status: 400 }
    );
  }

  try {
    jwt.verify(accessToken, JWT_SECRET);
    return NextResponse.json(
      { message: 'Token válido' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return NextResponse.json(
      { message: 'Token inválido' },
      { status: 401 }
    );
  }
}
