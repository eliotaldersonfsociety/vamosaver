import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: Request) {
  try {
    // Obtener las cookies de la petición
    const cookies = request.headers.get("cookie");
    if (!cookies) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    // Extraer el accessToken de las cookies
    const accessToken = cookies
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    if (!accessToken) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    // Verificar el token
    const decoded = jwt.verify(accessToken, JWT_SECRET) as any;

    return NextResponse.json(
      {
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.avatar || null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Token inválido" }, { status: 401 });
  }
}
