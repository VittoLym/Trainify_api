describe('Basic Test Setup', () => {
  // Test 1: Verificar Jest funciona
  test('Jest should be properly configured', () => {
    expect(true).toBe(true);
  });

  // Test 2: Verificar environment
  test('Environment variables should be loaded', () => {
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Verificar que las variables existen
    expect(process.env.NODE_ENV).toBeDefined();
    expect(process.env.DB_NAME).toBeDefined();
    
    // Verificar valores específicos
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.DB_NAME).toBe('neondb'); // Cambia esto si usas otro nombre
  });


  // Test 4: Verificar más variables
  test('JWT secrets should be defined', () => {
    expect(process.env.JWT_ACCESS_SECRET).toBeDefined();
    expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
    expect(process.env.JWT_ACCESS_SECRET.length).toBeGreaterThan(10);
  });
});