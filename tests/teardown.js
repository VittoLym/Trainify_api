// tests/teardown.js
module.exports = async () => {
  // Limpieza global después de todos los tests
  console.log('\n🧹 Cleaning up test environment...');
  
  // Cerrar conexiones a DB si es necesario
  try {
    const db = require('../src/config/database');
    if (db.pool && typeof db.pool.end === 'function') {
      await db.pool.end();
    }
  } catch (error) {
    // Ignorar errores si no hay conexión
  }
  
  console.log('✅ Test cleanup completed');
};