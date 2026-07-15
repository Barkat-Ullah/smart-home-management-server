import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Home Management API',
      version: '1.0.0',
      description: 'REST API for Smart Home Management System',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env.BASE_URL_SERVER || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          name: 'x-api-key',
          in: 'header',
        },
        apiAccessToken: {
          type: 'apiKey',
          name: 'x-api-access-token',
          in: 'header',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
        apiKey: [],
        apiAccessToken: [],
      },
    ],
  },
  apis: ['./src/app/modules/*/docs/*.yaml', './src/app/modules/*/docs/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
