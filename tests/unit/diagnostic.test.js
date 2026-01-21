const path = require('path');
const dotenv = require('dotenv');

describe('Environment Diagnostic', () => {
  test('Load .env.test file', () => {
    const envPath = path.resolve(__dirname, '../.env.test');
    console.log('Env file path:', envPath);
    
    // Leer archivo directamente
    const fs = require('fs');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('Env file content:');
    console.log(envContent);
    
    // Parsear manualmente
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    console.log('Parsed env vars:', envVars);
    
    expect(envVars.DB_NAME).toBe('neondb');
    expect(envVars.NODE_ENV).toBe('test');
  });

  test('Check current process.env', () => {
    console.log('Current process.env values:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- DB_NAME:', process.env.DB_NAME);
    console.log('- JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET ? 'DEFINED' : 'UNDEFINED');
    
    // Listar todas las variables que empiezan con DB_
    const dbVars = Object.keys(process.env).filter(key => 
      key.startsWith('DB_') || key.startsWith('JWT_')
    );
    console.log('Relevant env vars:', dbVars);
    
    expect(process.env.NODE_ENV).toBe('test');
  });
});