import swaggerJsdoc from 'swagger-jsdoc';

// Import Swagger documentation
import '../types/swagger';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Calisthenics App API',
      version: '1.0.0',
      description: 'API completa para aplicativo de calistenia com gestão de usuários, exercícios, treinos e progressão',
      contact: {
        name: 'Calisthenics App Team',
        email: 'contato@calisthenicsapp.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.calisthenicsapp.com/api/v1',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/types/swagger/*.ts',
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

export default swaggerJsdoc(options);
