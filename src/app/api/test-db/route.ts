import { NextResponse } from 'next/server';

// Ruta simple para pruebas que no requiere Prisma
export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Test API funcionando correctamente",
    timestamp: new Date().toISOString(),
    database: {
      status: "simulada",
      info: "Este endpoint no se conecta a la base de datos real"
    }
  });
} 