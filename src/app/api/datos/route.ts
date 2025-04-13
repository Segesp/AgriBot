import { NextRequest, NextResponse } from 'next/server';

// Estado temporal para desarrollo - esto sería reemplazado por datos de la DB en producción
const mockData = [
  {
    id: 1,
    deviceId: "ESP32_001",
    timestamp: new Date().toISOString(),
    temperatura: 25.5,
    humedad: 65.2,
    luz: 3500,
    humedadSuelo: 42.8,
    bateria: 87.3
  }
];

// La versión de producción utilizará una conexión directa a la base de datos
// Esta versión temporal permite que la construcción en Vercel se complete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validación básica
    if (!body.deviceId) {
      return NextResponse.json(
        { error: 'deviceId es requerido' }, 
        { status: 400 }
      );
    }
    
    // Mock de respuesta - en producción esto guardará en la DB
    return NextResponse.json({ 
      success: true, 
      message: "Datos recibidos correctamente - uso limitado en versión de demostración",
      data: {
        ...body,
        id: Date.now(),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error al procesar datos:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Retornar datos de muestra - en producción esto consultaría la DB
    return NextResponse.json({ 
      data: mockData,
      note: "Versión de demostración con datos de muestra"
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos' }, 
      { status: 500 }
    );
  }
} 