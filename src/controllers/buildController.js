const { ApiError } = require('../middleware/errorHandler');
const buildService = require('../services/buildService');
const logger = require('../utils/logger');

/**
 * Controlador para criação de uma configuração de PC
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
exports.createBuild = async (req, res, next) => {
  try {
    const { budget, usage, preferences } = req.body;

    // Validação básica
    if (!budget || budget <= 0) {
      throw ApiError.badRequest('Orçamento inválido. Deve ser um valor positivo.');
    }

    // Log da requisição
    logger.info(`Nova requisição de build com orçamento de R$ ${budget}`, { 
      usage, 
      preferences 
    });

    // Chamar o serviço para criar a build
    const buildResult = await buildService.createOptimalBuild(budget, usage, preferences);

    // Retornar o resultado
    return res.status(200).json(buildResult);
  } catch (error) {
    next(error);
  }
};