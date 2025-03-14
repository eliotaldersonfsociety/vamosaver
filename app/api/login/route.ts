import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { User } from '@/types/user';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRATION = '15m'; // Token de acceso expira en 15 minutos
const REFRESH_TOKEN_EXPIRATION = '7d'; // Refresh token expira en 7 días

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as User;

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email y contraseña son requeridos' },
      { status: 400 }
    );
  }

  try {
    const user = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email],
    });

    if (user.rows.length === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 400 }
      );
    }

    const userPassword = String(user.rows[0].password);

    if (!userPassword) {
      return NextResponse.json(
        { message: 'Contraseña no válida' },
        { status: 400 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, userPassword);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Contraseña incorrecta' },
        { status: 400 }
      );
    }

    const accessToken = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email, name: user.rows[0].name, lastname: user.rows[0].lastname, phone: user.rows[0].phone, postalcode: user.rows[0].postalcode, direction: user.rows[0].direction },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { userId: user.rows[0].id },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRATION }
    );

    await db.execute({
      sql: 'UPDATE users SET refresh_token = ? WHERE id = ?',
      args: [refreshToken, user.rows[0].id],
    });

    const response = NextResponse.json(
      {
        message: 'Inicio de sesión exitoso',
        token: accessToken,
        user: {
          name: user.rows[0].name,
          email: user.rows[0].email,
          avatar: user.rows[0].avatar,
        },
      },
      { status: 200 }
    );

    const isProduction = process.env.NODE_ENV === 'production';

    // Cookie accessToken (HTTP-only)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutos
      path: '/',
    });

    // Cookie refreshToken (HTTP-only)
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error en el endpoint de login:', error);
    return NextResponse.json(
      { message: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}