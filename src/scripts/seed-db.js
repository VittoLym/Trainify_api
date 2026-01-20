#!/usr/bin/env node

require('dotenv').config();
const seedExercises = require('../utils/seedExercises');

async function main() {
  console.log('🚀 Starting database seeding...');
  
  try {
    // Seed exercises
    await seedExercises();
    
    console.log('✅ All seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();