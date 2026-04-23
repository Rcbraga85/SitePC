const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Controlador para recomendações de upgrades
 */
exports.getRecommendations = async (req, res, next) => {
  try {
    const { currentBuild, budget } = req.query;
    
    // Em uma implementação real, analisaríamos a build atual e sugeríamos upgrades
    // Para este exemplo, vamos retornar recomendações simuladas
    
    const recommendations = [
      {
        component: 'GPU',
        current: 'GTX 1660 Super',
        recommendation: 'RTX 3060 Ti',
        price: 2499.90,
        performance_gain: '65%',
        priority: 'high'
      },
      {
        component: 'RAM',
        current: '8GB DDR4 2666MHz',
        recommendation: '16GB DDR4 3200MHz',
        price: 399.90,
        performance_gain: '30%',
        priority: 'medium'
      },
      {
        component: 'SSD',
        current: 'SSD SATA 256GB',
        recommendation: 'SSD NVMe 1TB',
        price: 599.90,
        performance_gain: '400%',
        priority: 'medium'
      }
    ];
    
    return res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};