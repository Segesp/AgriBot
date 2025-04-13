import { NextRequest, NextResponse } from 'next/server';

// Función para generar datos de prueba realistas
function generateMockData(days = 7, readings = 100) {
  const data = [];
  const now = new Date();
  const deviceIds = ["ESP32_001", "ESP32_002", "ESP32_003"];
  
  // Coordenadas para distintas ubicaciones (fincas de prueba)
  const locations = [
    { lat: 37.389444, lng: -5.984722 },  // Sevilla
    { lat: 38.015, lng: -1.130 },        // Murcia
    { lat: 39.470242, lng: -0.376800 },  // Valencia
  ];
  
  // Base values for sensors to simulate real field conditions
  const baseValues = {
    temperatura: 22,
    humedad: 65,
    luz: 5000,
    humedadSuelo: 45,
    salinidad: 1.8,
    bateria: 85
  };
  
  // Generate historical data
  for (let i = 0; i < readings; i++) {
    // Set timestamp with decreasing times
    const timestamp = new Date(now.getTime() - ((readings - i) * (24 * 60 * 60 * 1000) / readings * days));
    
    // Every third of the records, use a different device to simulate multiple devices
    const deviceIndex = Math.floor((i / readings) * deviceIds.length);
    const deviceId = deviceIds[deviceIndex];
    const location = locations[deviceIndex];
    
    // Time of day influences values (temperature, light, etc.)
    const hour = timestamp.getHours();
    const isDaytime = hour >= 8 && hour <= 19;
    const timeCoefficient = isDaytime ? Math.sin((hour - 8) * Math.PI / 11) : 0;
    
    // Day progression influences values (gradual change in soil conditions)
    const dayProgression = i / readings;
    
    // Add some noise for realism
    const noise = () => (Math.random() - 0.5) * 2;
    
    // Calculate realistic values with daily variations and trends
    const temperature = baseValues.temperatura + 
                       timeCoefficient * 8 +                 // Daily variation (+/- 8°C)
                       noise() * 1.5 +                       // Random noise
                       dayProgression * (Math.random() > 0.7 ? 3 : -2);  // Gradual trend
                       
    const humidity = baseValues.humedad - 
                    timeCoefficient * 15 +                  // Inverse to temperature
                    noise() * 5 +                           // Random noise
                    dayProgression * (Math.random() > 0.6 ? -8 : 5);  // Gradual trend
                    
    const light = isDaytime ? 
                 baseValues.luz * timeCoefficient * (1 + noise() * 0.3) :  // Day
                 baseValues.luz * 0.05 * (1 + noise() * 0.1);              // Night
                 
    const soilMoisture = baseValues.humedadSuelo +
                         noise() * 3 -                       // Random noise
                         dayProgression * 8 +                // Drying trend
                         (i % 20 === 0 ? 25 : 0);            // Simulate irrigation every 20 readings
                         
    const salinity = baseValues.salinidad +
                    noise() * 0.2 +                         // Random noise
                    dayProgression * (deviceIndex === 1 ? 1.2 : 0.3);  // Different trends by location
                    
    const battery = baseValues.bateria -
                   dayProgression * 15 +                    // Battery drain
                   (i % 30 === 0 ? 10 : 0) +               // Simulate partial recharge
                   noise() * 1;                             // Random noise
                   
    // Add some small random offset to GPS coords
    const lat = location.lat + (noise() * 0.001);
    const lng = location.lng + (noise() * 0.001);
    
    // Create the data record
    data.push({
      id: readings - i,
      deviceId,
      timestamp: timestamp.toISOString(),
      temperatura: Math.round(temperature * 10) / 10,
      humedad: Math.max(0, Math.min(100, Math.round(humidity * 10) / 10)),
      luz: Math.max(0, Math.round(light)),
      humedadSuelo: Math.max(0, Math.min(100, Math.round(soilMoisture * 10) / 10)),
      salinidad: Math.max(0, Math.round(salinity * 100) / 100),
      latitud: lat,
      longitud: lng,
      bateria: Math.max(0, Math.min(100, Math.round(battery * 10) / 10)),
      createdAt: timestamp.toISOString()
    });
  }
  
  // Sort by timestamp descending (newest first)
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Datos de prueba generados con variaciones realistas
const mockData = generateMockData();

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

export async function GET(request: NextRequest) {
  try {
    // Filtrar por dispositivo si se especifica
    const searchParams = request.nextUrl.searchParams;
    const deviceId = searchParams.get('deviceId');
    
    const filteredData = deviceId 
      ? mockData.filter(item => item.deviceId === deviceId)
      : mockData;
    
    // Retornar datos de muestra
    return NextResponse.json({ 
      data: filteredData,
      note: "Versión de demostración con datos de muestra",
      devices: Array.from(new Set(mockData.map(item => item.deviceId)))
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos' }, 
      { status: 500 }
    );
  }
} 