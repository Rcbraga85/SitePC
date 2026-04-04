const logger = require('../utils/logger');

/**
 * Middleware para tratamento centralizado de erros
 */
const errorHandler = (err, req, res, next) => {
  // Log do erro
  logger.error(`${err.name}: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Determinar o código de status HTTP
  const statusCode = err.statusCode || 500;
  
  // Resposta de erro para o cliente
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Erro interno do servidor',
      code: err.code || 'INTERNAL_ERROR'
    },
    // Incluir stack trace apenas em ambiente de desenvolvimento
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Classe personalizada para erros da API
 */
class ApiError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code = 'BAD_REQUEST') {
    return new ApiError(message, 400, code);
  }

  static notFound(message, code = 'NOT_FOUND') {
    return new ApiError(message, 404, code);
  }

  static internal(message, code = 'INTERNAL_ERROR') {
    return new ApiError(message, 500, code);
  }
}

module.exports = {
  errorHandler,
  ApiError
};