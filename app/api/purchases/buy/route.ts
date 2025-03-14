// app/api/purchase/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

// Función para obtener el user_id y los datos del usuario desde el token JWT
function getUserFromToken(req: NextRequest) {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: number; 
      name: string; 
      lastname: string; 
      email: string; 
      phone: string; 
      postalcode: string; 
      direction: string;
    };
    return decoded;
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Destructura los datos del body
    const { items, status, payment_method } = body;

    // Verificar si la lista de productos está vacía
    if (!items || items.length === 0) {
      return NextResponse.json({ message: "No items in the cart" }, { status: 400 });
    }

    // Obtener los datos del usuario desde el token JWT
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extraer los datos del usuario
    const { userId, name, lastname, email, phone, postalcode, direction } = user;

        // Calcular el total de la compra
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

        // Obtener el saldo actual del usuario
    const userResult = await db.execute({
      sql: `SELECT balance FROM users WHERE id = ?;`,
      args: [userId],
    });
    
    const currentBalance = Number(userResult.rows[0]?.balance) || 0;
    
        // Verificar si el saldo es suficiente
    if (currentBalance < total) {
      return NextResponse.json({ message: "Saldo insuficiente" }, { status: 400 });
    }
    
        // Restar el saldo de la compra
    const newBalance = currentBalance - Number(total);
    
        // Actualizar el saldo en la base de datos
    await db.execute({
      sql: `UPDATE users SET balance = ? WHERE id = ?;`,
      args: [newBalance, userId]
    });
    
    

    // Insertar la compra en la base de datos
    const purchaseResult = await db.execute({
      sql: `
        INSERT INTO purchases (
          user_id,
          item_name,
          price,
          status,
          payment_method,
          name,
          lastname,
          email,
          phone,
          postalcode,
          direction,
          quantity
        )
        VALUES
        ${items.map((item: any) => `
          (${userId}, '${item.name}', ${item.price}, '${status}', '${payment_method}', '${name}', '${lastname}', '${email}', '${phone}', '${postalcode}', '${direction}', '${item.quantity}')
        `).join(",")}
        RETURNING id, created_at;
      `,
      args: [],
    });

    // Responder con éxito
    return NextResponse.json({
      message: "Purchase saved successfully",
      purchase: purchaseResult.rows,
    });

  } catch (error) {
    console.error("Error saving purchase:", error);
    return NextResponse.json({ message: "Failed to save purchase" }, { status: 500 });
  }
}
