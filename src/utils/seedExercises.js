const db = require('./database');

const exercises = [
  // Strength - Chest
  {
    name: 'Press de Banca',
    description: 'Acostado en un banco, baja la barra al pecho y empuja hacia arriba',
    category: 'strength',
    muscle_group: 'chest',
    difficulty_level: 'intermediate',
    equipment_needed: 'barbell, bench',
    met_value: 3.8,
    average_calories_burned: 120
  },
  {
    name: 'Flexiones',
    description: 'Con el cuerpo recto, baja el pecho al suelo y empuja hacia arriba',
    category: 'strength',
    muscle_group: 'chest',
    difficulty_level: 'beginner',
    equipment_needed: 'bodyweight',
    met_value: 3.8,
    average_calories_burned: 80
  },
  {
    name: 'Press de Banca Inclinado',
    description: 'Similar al press de banca pero en banco inclinado',
    category: 'strength',
    muscle_group: 'chest',
    difficulty_level: 'intermediate',
    equipment_needed: 'barbell, incline bench',
    met_value: 4.0
  },

  // Strength - Legs
  {
    name: 'Sentadillas',
    description: 'Con los pies al ancho de hombros, baja las caderas como si fueras a sentarte',
    category: 'strength',
    muscle_group: 'legs',
    difficulty_level: 'beginner',
    equipment_needed: 'bodyweight',
    met_value: 5.0,
    average_calories_burned: 150
  },
  {
    name: 'Peso Muerto',
    description: 'Con la espalda recta, levanta la barra del suelo hasta la cintura',
    category: 'strength',
    muscle_group: 'legs',
    difficulty_level: 'advanced',
    equipment_needed: 'barbell',
    met_value: 6.0
  },
  {
    name: 'Zancadas',
    description: 'Da un paso hacia adelante y baja la rodilla trasera casi al suelo',
    category: 'strength',
    muscle_group: 'legs',
    difficulty_level: 'beginner',
    equipment_needed: 'bodyweight',
    met_value: 4.5
  },

  // Cardio
  {
    name: 'Correr',
    description: 'Carrera continua a ritmo moderado o intenso',
    category: 'cardio',
    muscle_group: null,
    difficulty_level: 'beginner',
    equipment_needed: 'running shoes',
    met_value: 9.8,
    average_calories_burned: 300
  },
  {
    name: 'Salto de Cuerda',
    description: 'Saltar la cuerda manteniendo un ritmo constante',
    category: 'cardio',
    muscle_group: null,
    difficulty_level: 'beginner',
    equipment_needed: 'jump rope',
    met_value: 12.3
  },
  {
    name: 'Burpees',
    description: 'Combinación de flexión, salto y sentadilla en un solo movimiento',
    category: 'cardio',
    muscle_group: 'full_body',
    difficulty_level: 'intermediate',
    equipment_needed: 'bodyweight',
    met_value: 8.0
  },

  // Flexibility
  {
    name: 'Estiramiento de Isquiotibiales',
    description: 'Sentado con una pierna extendida, inclínate hacia adelante',
    category: 'flexibility',
    muscle_group: 'legs',
    difficulty_level: 'beginner',
    equipment_needed: 'mat',
    met_value: 2.5
  },
  {
    name: 'Estiramiento de Pecho',
    description: 'En una puerta, coloca los brazos en los marcos y avanza',
    category: 'flexibility',
    muscle_group: 'chest',
    difficulty_level: 'beginner',
    equipment_needed: 'door frame',
    met_value: 2.5
  },

  // Strength - Back
  {
    name: 'Dominadas',
    description: 'Cuelga de una barra y levántate hasta que la barbilla supere la barra',
    category: 'strength',
    muscle_group: 'back',
    difficulty_level: 'advanced',
    equipment_needed: 'pull-up bar',
    met_value: 5.0
  },
  {
    name: 'Remo con Barra',
    description: 'Inclinado hacia adelante, tira de la barra hacia el pecho',
    category: 'strength',
    muscle_group: 'back',
    difficulty_level: 'intermediate',
    equipment_needed: 'barbell',
    met_value: 4.5
  },

  // Strength - Shoulders
  {
    name: 'Press Militar',
    description: 'De pie o sentado, empuja la barra por encima de la cabeza',
    category: 'strength',
    muscle_group: 'shoulders',
    difficulty_level: 'intermediate',
    equipment_needed: 'barbell',
    met_value: 4.0
  },
  {
    name: 'Elevaciones Laterales',
    description: 'De pie, eleva mancuernas a los lados hasta la altura de los hombros',
    category: 'strength',
    muscle_group: 'shoulders',
    difficulty_level: 'beginner',
    equipment_needed: 'dumbbells',
    met_value: 3.5
  },

  // Strength - Arms
  {
    name: 'Curl de Bíceps',
    description: 'De pie, flexiona los codos para elevar la barra hacia los hombros',
    category: 'strength',
    muscle_group: 'arms',
    difficulty_level: 'beginner',
    equipment_needed: 'barbell',
    met_value: 3.0
  },
  {
    name: 'Fondos en Paralelas',
    description: 'Sostenido en paralelas, baja el cuerpo flexionando los codos',
    category: 'strength',
    muscle_group: 'arms',
    difficulty_level: 'intermediate',
    equipment_needed: 'parallel bars',
    met_value: 4.0
  },

  // Core
  {
    name: 'Plancha',
    description: 'Mantén posición de flexión sobre antebrazos con cuerpo recto',
    category: 'strength',
    muscle_group: 'core',
    difficulty_level: 'beginner',
    equipment_needed: 'bodyweight',
    met_value: 3.0
  },
  {
    name: 'Crunch',
    description: 'Acostado boca arriba, levanta el torso hacia las rodillas',
    category: 'strength',
    muscle_group: 'core',
    difficulty_level: 'beginner',
    equipment_needed: 'bodyweight',
    met_value: 3.0
  }
];

async function seedExercises() {
  try {
    console.log('🌱 Starting exercise seed...');
    
    // Verificar si ya hay ejercicios
    const checkResult = await db.query('SELECT COUNT(*) FROM exercises');
    const count = parseInt(checkResult.rows[0].count, 10);
    
    if (count > 0) {
      console.log(`📊 Exercises already exist (${count} records). Skipping seed.`);
      return;
    }

    // Insertar ejercicios
    for (const exercise of exercises) {
      await db.query(
        `INSERT INTO exercises (
          name, description, category, muscle_group, 
          difficulty_level, equipment_needed, met_value, average_calories_burned
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          exercise.name,
          exercise.description,
          exercise.category,
          exercise.muscle_group,
          exercise.difficulty_level,
          exercise.equipment_needed,
          exercise.met_value || 3.0,
          exercise.average_calories_burned || null
        ]
      );
      console.log(`✅ Added: ${exercise.name}`);
    }

    console.log('🎉 Exercise seed completed successfully!');
    console.log(`📈 Total exercises seeded: ${exercises.length}`);
  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
    throw error;
  }
}

module.exports = seedExercises;