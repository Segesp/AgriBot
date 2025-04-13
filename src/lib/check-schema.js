// Script para verificar la estructura de la tabla SensorData
const { Pool } = require('pg');
require('dotenv').config();

async function checkSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    console.log('Conexión establecida correctamente a PostgreSQL');
    
    // Verificar la estructura de la tabla
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'SensorData' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nEstructura de la tabla SensorData:');
    console.log('---------------------------------');
    tableInfo.rows.forEach(column => {
      console.log(`${column.column_name.padEnd(15)} | ${column.data_type.padEnd(20)} | Nullable: ${column.is_nullable}`);
    });
    
    // Verificar las restricciones (primary key, etc.)
    const constraintInfo = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(c.oid) as constraintdef
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      JOIN pg_class cl ON cl.oid = c.conrelid
      WHERE cl.relname = 'SensorData'
      AND n.nspname = 'public'
    `);
    
    console.log('\nRestricciones de la tabla:');
    console.log('-------------------------');
    constraintInfo.rows.forEach(constraint => {
      let type = '';
      switch(constraint.contype) {
        case 'p': type = 'PRIMARY KEY'; break;
        case 'f': type = 'FOREIGN KEY'; break;
        case 'u': type = 'UNIQUE'; break;
        case 'c': type = 'CHECK'; break;
        default: type = constraint.contype;
      }
      console.log(`${constraint.conname} | ${type} | ${constraint.constraintdef}`);
    });
    
    client.release();
  } catch (err) {
    console.error('Error al verificar el esquema:', err);
  } finally {
    await pool.end();
  }
}

checkSchema(); 