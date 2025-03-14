import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

function getUserIdFromToken(req: NextRequest): number | null {
  try {
    const token = req.cookies.get("accessToken")?.value;
    console.log("Token:", token);  // Verifica si se recupera el token
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    console.log("Decoded User ID:", decoded.userId); // Verifica el valor extraído del token

    return decoded.userId;
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener compras del usuario autenticado
    const purchases = await db.execute({
      sql: "SELECT * FROM purchases WHERE user_id = ?",
      args: [userId],
    });

    console.log("Purchases:", purchases.rows);  // Verifica los datos que se están devolviendo

    return NextResponse.json({ purchases: purchases.rows });
  } catch (error) {
    console.error("Error al obtener compras:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
