import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validación básica
    if (!body.deviceId) {
      return NextResponse.json({ error: 'deviceId es requerido' }, { status: 400 });
    }
    
    // Guardando los datos en la base de datos
    const sensorData = await prisma.sensorData.create({
      data: {
        deviceId: body.deviceId,
        temperatura: body.temperatura ?? null,
        humedad: body.humedad ?? null,
        luz: body.luz ?? null,
        humedadSuelo: body.humedadSuelo ?? null,
        latitud: body.latitud ?? null,
        longitud: body.longitud ?? null,
        bateria: body.bateria ?? null,
      }
    });
    
    return NextResponse.json({ success: true, data: sensorData });
  } catch (error) {
    console.error('Error al procesar datos:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Obteniendo los datos más recientes (últimos 100)
    const sensorData = await prisma.sensorData.findMany({
      take: 100,
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    return NextResponse.json({ data: sensorData });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 });
  }
} 