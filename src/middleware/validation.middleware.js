const Joi = require('joi');

// Esquemas de validación
const validationSchemas = {
  // Registro de usuario
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Por favor proporciona una dirección de email válida',
      'any.required': 'El email es requerido'
    }),
    username: Joi.string()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required()
      .messages({
        'string.pattern.base': 'El nombre de usuario solo puede contener letras, números y guiones bajos',
        'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
        'string.max': 'El nombre de usuario no puede exceder 30 caracteres',
        'any.required': 'El nombre de usuario es requerido'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'string.pattern.base': 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número',
        'any.required': 'La contraseña es requerida'
      }),
    firstName: Joi.string().max(50).optional().allow('', null),
    lastName: Joi.string().max(50).optional().allow('', null),
    dateOfBirth: Joi.date().max('now').optional().allow('', null),
    heightCm: Joi.number().min(50).max(250).optional().allow('', null),
    weightKg: Joi.number().min(20).max(300).optional().allow('', null),
    fitnessLevel: Joi.string()
      .valid('beginner', 'intermediate', 'advanced')
      .default('beginner')
      .optional()
  }),

  // Login
  login: Joi.object({
    email: Joi.string().email().optional().allow('', null),
    username: Joi.string().optional().allow('', null),
    password: Joi.string().required()
  }).or('email', 'username').messages({
    'object.missing': 'Se requiere email o nombre de usuario'
  }),

  // Actualizar perfil
  updateProfile: Joi.object({
    firstName: Joi.string().max(50).optional().allow('', null),
    lastName: Joi.string().max(50).optional().allow('', null),
    dateOfBirth: Joi.date().max('now').optional().allow('', null),
    heightCm: Joi.number().min(50).max(250).optional().allow('', null),
    weightKg: Joi.number().min(20).max(300).optional().allow('', null),
    fitnessLevel: Joi.string()
      .valid('beginner', 'intermediate', 'advanced')
      .optional()
  }).min(1).messages({
    'object.min': 'Se requiere al menos un campo para actualizar'
  }),

  // Cambiar contraseña
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'La nueva contraseña debe tener al menos 8 caracteres',
        'string.pattern.base': 'La nueva contraseña debe contener al menos una letra mayúscula, una minúscula y un número'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Las contraseñas no coinciden'
      })
  }),

  // Crear workout
  createWorkout: Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      'string.min': 'El nombre del entrenamiento debe tener al menos 3 caracteres',
      'string.max': 'El nombre del entrenamiento no puede exceder 100 caracteres',
      'any.required': 'El nombre del entrenamiento es requerido'
    }),
    description: Joi.string().max(500).optional().allow('', null),
    workoutType: Joi.string()
      .valid('strength', 'cardio', 'hiit', 'flexibility', 'custom')
      .default('strength'),
    scheduledDate: Joi.date().min('now').required().messages({
      'date.min': 'La fecha programada no puede ser en el pasado'
    }),
    scheduledTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .allow('', null)
      .messages({
        'string.pattern.base': 'Formato de hora inválido (HH:MM)'
      }),
    durationMinutes: Joi.number().integer().min(1).max(480).optional(),
    exercises: Joi.array()
      .items(
        Joi.object({
          exerciseId: Joi.string().uuid().required().messages({
            'string.guid': 'ID de ejercicio inválido'
          }),
          sets: Joi.number().integer().min(1).max(20).default(3),
          reps: Joi.number().integer().min(1).max(100).default(10),
          weight: Joi.number().min(0).max(500).optional().allow(null),
          distanceKm: Joi.number().min(0).max(100).optional().allow(null),
          durationMinutes: Joi.number().min(0).max(120).optional().allow(null),
          restTimeSeconds: Joi.number().integer().min(0).max(600).default(60),
          orderIndex: Joi.number().integer().min(0).default(0),
          notes: Joi.string().max(200).optional().allow('', null)
        })
      )
      .min(1)
      .optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional()
  }),

  // Actualizar workout
  updateWorkout: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional().allow('', null),
    workoutType: Joi.string()
      .valid('strength', 'cardio', 'hiit', 'flexibility', 'custom')
      .optional(),
    scheduledDate: Joi.date().optional(),
    scheduledTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .allow('', null),
    durationMinutes: Joi.number().integer().min(1).max(480).optional(),
    status: Joi.string()
      .valid('scheduled', 'in_progress', 'completed', 'cancelled', 'skipped')
      .optional(),
    comments: Joi.string().max(500).optional().allow('', null),
    rating: Joi.number().integer().min(1).max(5).optional(),
    perceivedEffort: Joi.number().integer().min(1).max(10).optional(),
    completedAt: Joi.date().optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional()
  }).min(1).messages({
    'object.min': 'Se requiere al menos un campo para actualizar'
  }),

  // Crear/actualizar ejercicio (solo admin)
  exercise: Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().optional().allow('', null),
    category: Joi.string()
      .valid('strength', 'cardio', 'flexibility', 'balance', 'mobility')
      .required(),
    muscleGroup: Joi.string()
      .valid('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body', null)
      .optional()
      .allow('', null),
    difficultyLevel: Joi.string()
      .valid('beginner', 'intermediate', 'advanced')
      .default('beginner'),
    equipmentNeeded: Joi.string().max(100).default('bodyweight').optional(),
    metValue: Joi.number().min(0).max(20).optional(),
    averageCaloriesBurned: Joi.number().min(0).optional(),
    videoUrl: Joi.string().uri().max(500).optional().allow('', null)
  }),

  // Generar reporte
  generateReport: Joi.object({
    startDate: Joi.date().required().messages({
      'date.base': 'Fecha de inicio inválida'
    }),
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .required()
      .messages({
        'date.base': 'Fecha de fin inválida',
        'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio'
      }),
    reportType: Joi.string()
      .valid('progress', 'volume', 'frequency', 'completion', 'performance')
      .default('progress'),
    groupBy: Joi.string()
      .valid('day', 'week', 'month', 'exercise')
      .default('week'),
    exerciseId: Joi.string().uuid().optional().allow('', null)
  }),

  // Paginación y filtros
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().optional().allow('', null)
  }),

  // Filtrar workouts
  filterWorkouts: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    status: Joi.string()
      .valid('scheduled', 'in_progress', 'completed', 'cancelled', 'skipped')
      .optional(),
    workoutType: Joi.string()
      .valid('strength', 'cardio', 'hiit', 'flexibility', 'custom')
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  // Filtrar ejercicios
  filterExercises: Joi.object({
    category: Joi.string()
      .valid('strength', 'cardio', 'flexibility', 'balance', 'mobility')
      .optional(),
    muscleGroup: Joi.string()
      .valid('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body')
      .optional(),
    difficultyLevel: Joi.string()
      .valid('beginner', 'intermediate', 'advanced')
      .optional(),
    equipmentNeeded: Joi.string().optional(),
    search: Joi.string().optional().allow('', null),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  // UUID validation (para parámetros de ruta)
  uuidParam: Joi.object({
    id: Joi.string().uuid().required()
  })
};

/**
 * Middleware factory para validar request body
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validationSchema = validationSchemas[schema];
      
      if (!validationSchema) {
        return res.status(500).json({
          success: false,
          message: 'Validation schema not found',
          code: 'VALIDATION_SCHEMA_ERROR'
        });
      }

      const { error, value } = validationSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const errorMessages = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
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

/**
 * Middleware para validar parámetros de ruta
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validationSchema = validationSchemas[schema];
      
      if (!validationSchema) {
        return res.status(500).json({
          success: false,
          message: 'Validation schema not found',
          code: 'VALIDATION_SCHEMA_ERROR'
        });
      }

      const { error, value } = validationSchema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errorMessages = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }));

        return res.status(400).json({
          success: false,
          message: 'Invalid parameters',
          errors: errorMessages,
          code: 'INVALID_PARAMETERS'
        });
      }

      // Reemplazar params con valores validados
      req.params = value;
      next();
    } catch (error) {
      console.error('Params validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'VALIDATION_ERROR'
      });
    }
  };
};

/**
 * Middleware para validar query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validationSchema = validationSchemas[schema];
      
      if (!validationSchema) {
        return res.status(500).json({
          success: false,
          message: 'Validation schema not found',
          code: 'VALIDATION_SCHEMA_ERROR'
        });
      }

      const { error, value } = validationSchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        convert: true // Convierte strings a números cuando sea apropiado
      });

      if (error) {
        const errorMessages = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }));

        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: errorMessages,
          code: 'INVALID_QUERY_PARAMS'
        });
      }

      // Reemplazar query con valores validados
      req.query = value;
      next();
    } catch (error) {
      console.error('Query validation error:', error);
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
  validateParams,
  validateQuery,
  validationSchemas
};