const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Trainify API',
      version: '1.0.0',
      description: 'API documentation for Trainify API',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'], // Archivos con anotaciones JSDoc
};

const specs = swaggerJsdoc(options);
module.exports = specs;