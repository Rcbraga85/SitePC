const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Site PC Gamer API',
      version: '1.0.0',
      description: 'Documentação da API do sistema de montagem de PC Gamer',
      contact: {
        name: 'Suporte Site PC Gamer',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      schemas: {
        Store: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            base_url: { type: 'string' },
            logo_url: { type: 'string' },
            is_active: { type: 'boolean' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            code: { type: 'string' },
            name: { type: 'string' },
            name_pt: { type: 'string' },
            description: { type: 'string' },
          },
        },
        Component: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            price: { type: 'number' },
            category_id: { type: 'string', format: 'uuid' },
            store_id: { type: 'string', format: 'uuid' },
            product_url: { type: 'string' },
            image_url: { type: 'string' },
            brand: { type: 'string' },
            in_stock: { type: 'boolean' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Caminho para os arquivos de rota com JSDoc
};

const specs = swaggerJsdoc(options);

module.exports = specs;
