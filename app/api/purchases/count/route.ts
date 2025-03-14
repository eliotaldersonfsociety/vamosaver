import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';  // Asegúrate de que 'db' sea tu instancia de base de datos

export async function GET(req: NextRequest) {
  try {
    // Realizamos la consulta para contar las compras
    const result = await db.execute({
      sql: 'SELECT COUNT(*) AS purchaseCount FROM purchases',
      args: [],
    });

    const purchaseCount = result.rows[0].purchaseCount;
    return NextResponse.json({ purchaseCount }); // Retornar el número de compras
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener el número de compras' }, { status: 500 });
  }
}
