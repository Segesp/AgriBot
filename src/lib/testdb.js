// Script para probar la conexión directamente con PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
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
    
    // Ejecutar una consulta simple
    const result = await client.query('SELECT current_database() as db_name');
    console.log('Base de datos:', result.rows[0].db_name);
    
    // Comprobar si existe la tabla SensorData
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'SensorData'
      );
    `);
    
    console.log('¿Existe la tabla SensorData?', tableCheck.rows[0].exists);
    
    // Liberar el cliente
    client.release();
  } catch (err) {
    console.error('Error al conectar a PostgreSQL:', err);
  } finally {
    // Cerrar el pool
    await pool.end();
  }
}

testConnection(); 