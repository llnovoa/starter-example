// test-password.js
require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  console.log('🔍 Probando conexión con nueva contraseña...');

  // Oculta la contraseña en los logs
  const url = process.env.POSTGRES_URL || 'postgresql://postgres.mhovrsxnqfoicckqrvpw:Trathos*2025@aws-1-us-east-1.pooler.supabase.com:5432/postgres';
  const safeUrl = url.replace(/:[^:@]+@/, ':****@');
  console.log('URL:', safeUrl);

  const client = new Client({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000 // 10 segundos
  });

  try {
    console.log('⏳ Conectando...');
    await client.connect();
    console.log('✅ ¡CONEXIÓN EXITOSA!');

    // Test simple
    const result = await client.query('SELECT NOW() as server_time, version() as pg_version');
    console.log('⏰ Hora del servidor:', result.rows[0].server_time);
    console.log('🐘 PostgreSQL:', result.rows[0].pg_version.split(',')[0]);

    // Verificar si hay tablas
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📊 Tablas existentes en la base de datos:');
    if (tables.rows.length === 0) {
      console.log('   (No hay tablas - perfecto para el seed)');
    } else {
      tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
    }

    return true;

  } catch (error) {
    console.error('❌ ERROR DE CONEXIÓN:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);

    // Errores comunes
    if (error.code === '28P01') {
      console.error('\n🔑 PROBLEMA DE AUTENTICACIÓN:');
      console.error('   - La contraseña puede ser incorrecta');
      console.error('   - Verifica que no haya espacios al final');
      console.error('   - Asegúrate de usar: Trathos*2025 (con el *)');
    }

    if (error.code === 'ECONNREFUSED') {
      console.error('\n🌐 PROBLEMA DE RED:');
      console.error('   - El puerto 5432 puede estar bloqueado');
      console.error('   - Verifica tu firewall/antivirus');
      console.error('   - Prueba desde otra red');
    }

    return false;
  } finally {
    if (client) {
      await client.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar
testConnection();
