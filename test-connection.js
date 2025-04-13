// Script para probar la conexión a Neon PostgreSQL
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Intentar consultar la base de datos
    const result = await prisma.$queryRaw`SELECT current_database()`;
    console.log('¡Conexión exitosa a la base de datos Neon!', result);
    
    // Contar registros en la tabla SensorData
    const count = await prisma.sensorData.count();
    console.log(`Número de registros en SensorData: ${count}`);
    
    // Intentar crear un registro de prueba
    const testData = await prisma.sensorData.create({
      data: {
        deviceId: 'TEST_CONNECTION',
        temperatura: 22.5,
        humedad: 60.0,
        luz: 1000,
        humedadSuelo: 40.5,
        bateria: 95.0
      }
    });
    console.log('Registro de prueba creado:', testData);
    
  } catch (e) {
    console.error('Error al conectar a la base de datos:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 