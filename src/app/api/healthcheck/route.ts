import { NextResponse } from 'next/server';

// Ruta simple que no requiere Prisma
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
} 