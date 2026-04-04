const { ApiError } = require('../middleware/errorHandler');
const componentService = require('../services/componentService');
const logger = require('../utils/logger');

/**
 * Controlador para gerenciar categorias de componentes
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = componentService.getCategories();
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para buscar componentes por categoria
 */
exports.getComponentsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const filters = req.query;
    
    // Validar categoria
    if (!category) {
      throw ApiError.badRequest('Categoria não especificada');
    }
    
    // Buscar componentes
    const components = await componentService.getComponentsByCategory(category, filters);
    
    return res.status(200).json({ 
      success: true, 
      category,
      count: components.length,
      components 
    });
  } catch (error) {
    next(error);
  }
};