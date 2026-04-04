require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');
const path = require('path');

// Inicialização do app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar para facilitar o preview
})); 
app.use(cors()); // Habilita CORS
app.use(express.json()); // Parse de JSON
app.use(morgan('dev')); // Logging de requisições

// Arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));

// Rotas
app.use('/api', routes);

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar o servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV}`);
  console.log(`Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV}`);
});

// Tratamento de exceções não capturadas
process.on('uncaughtException', (error) => {
  logger.error('Exceção não capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejeição não tratada em:', promise, 'razão:', reason);
});

module.exports = app;