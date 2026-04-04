const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const terabyteShop = require('../scrapers/terabyteShop');
const pichau = require('../scrapers/pichau');

/**
 * Controlador para comparação de preços
 */
exports.comparePrice = async (req, res, next) => {
  try {
    const { componentId } = req.params;
    const { name } = req.query;
    
    if (!componentId && !name) {
      throw ApiError.badRequest('É necessário fornecer o ID do componente ou o nome para comparação');
    }
    
    // Em uma implementação real, buscaríamos o mesmo produto em diferentes lojas
    // Para este exemplo, vamos simular uma comparação de preços
    
    const results = [
      {
        store: 'TerabyteShop',
        price: 1899.90,
        installmentPrice: 2099.90,
        url: 'https://www.terabyteshop.com.br/produto/exemplo',
        inStock: true
      },
      {
        store: 'Pichau',
        price: 1849.90,
        installmentPrice: 2049.90,
        url: 'https://www.pichau.com.br/produto/exemplo',
        inStock: true
      },
      {
        store: 'Kabum',
        price: 1929.90,
        installmentPrice: 2129.90,
        url: 'https://www.kabum.com.br/produto/exemplo',
        inStock: false
      }
    ];
    
    // Ordenar por preço (crescente)
    results.sort((a, b) => a.price - b.price);
    
    return res.status(200).json({
      success: true,
      componentId,
      name: name || 'Componente exemplo',
      results
    });
  } catch (error) {
    next(error);
  }
};