import { NextResponse } from 'next/server';

// Esta ruta simple siempre funcionará, sin dependencias
export function GET() {
  return NextResponse.json({
    status: "online",
    version: "1.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
} 