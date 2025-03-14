import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db"; // Usando @libsql/client como mencionaste antes

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: Request) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  
  if (!accessToken) {
    return NextResponse.json({ message: "Access token not provided" }, { status: 400 });
  }

  try {
      // Verificar el token y extraer el payload (asumimos que contiene "userId")
      const payload = jwt.verify(accessToken, JWT_SECRET) as { userId: number };
      const userId = payload.userId;

    // Busca el usuario en la base de datos
    const result = await db.execute({
      sql: "SELECT id, name, lastname, email, isAdmin FROM users WHERE id = ?",
      args: [userId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json({
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error("Error en la API de usuario:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
