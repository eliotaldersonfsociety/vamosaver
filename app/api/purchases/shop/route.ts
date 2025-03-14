import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  console.error("JWT_SECRET no está definido");
}

function getUserFromToken(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      console.error("No se encontró el token");
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded;
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Obtener compras solo desde purchases SIN JOIN
    const purchases = await db.execute({
      sql: `
        SELECT 
          id, 
          item_name, 
          price, 
          status, 
          payment_method, 
          quantity, 
          created_at
        FROM purchases
        WHERE user_id = ?
        ORDER BY created_at DESC;
      `,
      args: [user.userId],
    });

    console.log("Fetched purchases:", purchases.rows);

    return NextResponse.json({ purchases: purchases.rows });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { message: "Failed to fetch purchases", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
