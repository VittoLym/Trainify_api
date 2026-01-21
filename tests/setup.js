// tests/setup.js
const path = require('path');
const dotenv = require('dotenv');

// 1. CARGAR VARIABLES DE ENTORNO DE TEST
const envPath = path.resolve(__dirname, '../.env.test');
console.log('📁 Loading test env from:', envPath);

// Verificar si el archivo existe
const fs = require('fs');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.test file not found at:', envPath);
  // Crear archivo si no existe
  fs.writeFileSync(envPath, `DB_NAME=neondb\nNODE_ENV=test\n`);
}

// Cargar variables
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env.test:', result.error);
} else {
  console.log('✅ .env.test loaded successfully');
  console.log('📊 DB_NAME:', process.env.DB_NAME);
  console.log('📊 NODE_ENV:', process.env.NODE_ENV);
}

// 2. ASEGURAR QUE LAS VARIABLES ESTÉN SETEADAS
// Si no se cargaron, establecer valores por defecto
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
  console.log('⚠️  NODE_ENV set to default: test');
}

if (!process.env.DB_NAME) {
  process.env.DB_NAME = 'neondb';
  console.log('⚠️  DB_NAME set to default: neondb');
}

// 3. CONFIGURACIÓN JEST
jest.setTimeout(30000);

// 4. MOCK DE CONSOLE (opcional)
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  };
}

// 5. LIMPIAR MOCKS DESPUÉS DE CADA TEST
afterEach(() => {
  jest.clearAllMocks();
});