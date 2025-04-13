import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Contar registros en la tabla SensorData
    const count = await prisma.sensorData.count();
    
    // Obtener los últimos registros
    const records = await prisma.sensorData.findMany({
      take: 5,
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      count,
      records
    });
  } catch (error) {
    console.error('Error al probar la conexión DB:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
} 