import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { User } from '@/types/user';

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as User;

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email y contraseña son requeridos' },
      { status: 400 }
    );
  }

  try {
    // Verificar si el usuario ya existe
    const user = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email],
    });

    if (user.rows.length > 0) {
      return NextResponse.json(
        { message: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    await db.execute({
      sql: 'INSERT INTO users (email, password) VALUES (?, ?)',
      args: [email, hashedPassword],
    });

    return NextResponse.json(
      { message: 'Usuario registrado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Error al registrar el usuario' },
      { status: 500 }
    );
  }
}