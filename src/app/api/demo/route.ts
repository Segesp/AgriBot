import { NextRequest, NextResponse } from 'next/server';

// Datos de demostración
const demoData = [
  {
    id: 1,
    deviceId: "ESP32_001",
    timestamp: "2025-04-14T12:00:00Z",
    temperatura: 25.5,
    humedad: 65.2,
    luz: 3500,
    humedadSuelo: 42.8,
    bateria: 87.3
  },
  {
    id: 2,
    deviceId: "ESP32_002",
    timestamp: "2025-04-14T12:15:00Z",
    temperatura: 26.2,
    humedad: 64.8,
    luz: 3700,
    humedadSuelo: 40.1,
    bateria: 85.5
  }
];

export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "API de demostración funcionando correctamente",
    data: demoData
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      status: "success",
      message: "Datos recibidos correctamente",
      receivedData: body,
      note: "Este es un endpoint de demostración. Los datos no se guardan permanentemente."
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Error al procesar la solicitud"
    }, { status: 400 });
  }
} 