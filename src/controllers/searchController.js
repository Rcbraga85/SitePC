const { ApiError } = require('../middleware/errorHandler');
const componentService = require('../services/componentService');
const logger = require('../utils/logger');

/**
 * Controlador para pesquisa de componentes
 */
exports.searchComponents = async (req, res, next) => {
  console.log("rodrigo")
  try {
    const { q, category, maxPrice } = req.query;
    
    // Validar termo de pesquisa
    if (!q || q.trim().length < 3) {
      throw ApiError.badRequest('Termo de pesquisa deve ter pelo menos 3 caracteres');
    }
    
    // Preparar filtros
    const filters = {};
    if (category) filters.category = category;
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    
    // Buscar componentes
    const components = await componentService.searchComponents(q, filters);
    
    return res.status(200).json({
      success: true,
      query: q,
      count: components.length,
      components
    });
  } catch (error) {
    next(error);
  }
};