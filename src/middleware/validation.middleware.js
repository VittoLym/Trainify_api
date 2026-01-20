const Joi = require('joi');

// Esquemas de validación
const validationSchemas = {
  // Registro de usuario
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    username: Joi.string()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Username can only contain letters, numbers and underscores',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter and one number',
        'any.required': 'Password is required'
      }),
    firstName: Joi.string().max(50).optional(),
    lastName: Joi.string().max(50).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    heightCm: Joi.number().min(50).max(250).optional(),
    weightKg: Joi.number().min(20).max(300).optional(),
    fitnessLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner')
  }),

  // Login
  login: Joi.object({
    email: Joi.string().email().optional(),
    username: Joi.string().optional(),
    password: Joi.string().required()
  }).or('email', 'username'), // Requiere email o username

  // Crear workout
  createWorkout: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    workoutType: Joi.string()
      .valid('strength', 'cardio', 'hiit', 'flexibility', 'custom')
      .default('strength'),
    scheduledDate: Joi.date().min('now').required(),
    scheduledTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    exercises: Joi.array().items(
      Joi.object({
        exerciseId: Joi.string().uuid().required(),
        sets: Joi.number().integer().min(1).default(3),
        reps: Joi.number().integer().min(1).default(10),
        weight: Joi.number().min(0).optional(),
        restTimeSeconds: Joi.number().integer().min(0).default(60),
        notes: Joi.string().max(200).optional()
      })
    ).min(1).optional()
  }),

  // Actualizar workout
  updateWorkout: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'cancelled', 'skipped').optional(),
    comments: Joi.string().max(500).optional(),
    rating: Joi.number().integer().min(1).max(5).optional(),
    perceivedEffort: Joi.number().integer().min(1).max(10).optional()
  }),

  // Generar reporte
  generateReport: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    reportType: Joi.string()
      .valid('progress', 'volume', 'frequency', 'completion')
      .default('progress')
  })
};

/**
 * Middleware factory para validar request body
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = validationSchemas[schema].validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errorMessages = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errorMessages,
          code: 'VALIDATION_ERROR'
        });
      }

      // Reemplazar body con valores validados
      req.body = value;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'VALIDATION_ERROR'
      });
    }
  };
};

module.exports = {
  validate,
  validationSchemas
};