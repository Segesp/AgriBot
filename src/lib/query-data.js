// Script para consultar datos de SensorData
const { Pool } = require('pg');
require('dotenv').config();

async function queryData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Probar la conexión
    const client = await pool.connect();
    console.log('Conexión establecida correctamente a PostgreSQL');
    
    // Contar registros
    const countResult = await client.query('SELECT COUNT(*) FROM "SensorData"');
    console.log('Número de registros:', countResult.rows[0].count);
    
    // Traer los últimos 5 registros
    const dataResult = await client.query(`
      SELECT * FROM "SensorData" 
      ORDER BY "timestamp" DESC 
      LIMIT 5
    `);
    
    console.log('\nÚltimos registros:');
    if (dataResult.rows.length === 0) {
      console.log('No hay registros en la tabla');
      
      // Insertar un registro de prueba
      const insertResult = await client.query(`
        INSERT INTO "SensorData" 
        ("deviceId", "temperatura", "humedad", "luz", "humedadSuelo", "bateria") 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      `, ['TEST_SCRIPT', 25.5, 68.2, 1500, 55.3, 85.0]);
      
      console.log('\nRegistro insertado:');
      console.log(insertResult.rows[0]);
    } else {
      dataResult.rows.forEach((row, index) => {
        console.log(`\n-- Registro ${index + 1} --`);
        console.log('ID:', row.id);
        console.log('Dispositivo:', row.deviceId);
        console.log('Timestamp:', row.timestamp);
        console.log('Temperatura:', row.temperatura);
        console.log('Humedad:', row.humedad);
        console.log('Luz:', row.luz);
        console.log('Humedad del suelo:', row.humedadSuelo);
        console.log('Batería:', row.bateria);
      });
    }
    
    // Liberar el cliente
    client.release();
  } catch (err) {
    console.error('Error al consultar datos:', err);
  } finally {
    // Cerrar el pool
    await pool.end();
  }
}

queryData(); 