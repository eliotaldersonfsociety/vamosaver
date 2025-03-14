import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value; // Obtener cookie correctamente

    if (!token) {
      return NextResponse.json(
        { message: 'Token no encontrado' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { message: 'Token inválido o expirado' },
        { status: 403 }
      );
    }

    const userId = (decoded as any).userId;

    const user = await db.execute({
      sql: `SELECT balance FROM users WHERE id = ?`,
      args: [userId],
    });

    if (user.rows.length === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { balance: user.rows[0].balance },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener saldo:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
