const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const cacheService = require('./cacheService');
const componentService = require('./componentService');

// Distribuição padrão do orçamento por categoria
const DEFAULT_BUDGET_DISTRIBUTION = {
  CPU: 0.20,    // 20% para processador
  GPU: 0.35,    // 35% para placa de vídeo
  RAM: 0.10,    // 10% para memória RAM
  STORAGE: 0.10, // 10% para armazenamento
  MOTHERBOARD: 0.15, // 15% para placa-mãe
  PSU: 0.05,    // 5% para fonte
  CASE: 0.05    // 5% para gabinete
};

// Ajustes de distribuição baseados no tipo de uso
const USAGE_ADJUSTMENTS = {
  'games': {
    GPU: 0.05,  // +5% para GPU
    CPU: -0.02, // -2% para CPU
    RAM: -0.01, // -1% para RAM
    STORAGE: -0.02 // -2% para armazenamento
  },
  'edição de vídeo': {
    CPU: 0.03,  // +3% para CPU
    RAM: 0.02,  // +2% para RAM
    STORAGE: 0.02, // +2% para armazenamento
    GPU: -0.07  // -7% para GPU
  },
  'programação': {
    RAM: 0.03,  // +3% para RAM
    CPU: 0.02,  // +2% para CPU
    STORAGE: 0.02, // +2% para armazenamento
    GPU: -0.07  // -7% para GPU
  },
  'design': {
    GPU: 0.02,  // +2% para GPU
    RAM: 0.02,  // +2% para RAM
    CPU: 0.01,  // +1% para CPU
    CASE: -0.05 // -5% para gabinete
  }
};

/**
 * Cria uma configuração otimizada de PC com base no orçamento e preferências
 * @param {number} budget - Orçamento total em reais
 * @param {string} usage - Tipo de uso (games, edição de vídeo, etc)
 * @param {Object} preferences - Preferências do usuário (marcas, etc)
 * @returns {Promise<Object>} - Configuração otimizada
 */
exports.createOptimalBuild = async (budget, usage, preferences = {}) => {
  try {
    // Verificar cache primeiro
    const cacheKey = `build:${budget}:${usage}:${JSON.stringify(preferences)}`;
    const cachedResult = cacheService.get(cacheKey);
    
    if (cachedResult) {
      logger.info(`Retornando resultado em cache para orçamento R$ ${budget}`);
      return cachedResult;
    }

    // Distribuir o orçamento entre as categorias
    const budgetDistribution = calculateBudgetDistribution(budget, usage);
    logger.debug('Distribuição de orçamento calculada', { budgetDistribution });

    // Buscar os melhores componentes para cada categoria
    const components = await findOptimalComponents(budgetDistribution, preferences);

    // Calcular o total da configuração
    const total = components.reduce((sum, component) => sum + component.price, 0);

    // Montar o resultado
    const result = {
      total: parseFloat(total.toFixed(2)),
      components
    };

    // Armazenar em cache
    cacheService.set(cacheKey, result);

    return result;
  } catch (error) {
    logger.error('Erro ao criar build otimizada:', error);
    throw error;
  }
};

/**
 * Calcula a distribuição do orçamento entre as categorias
 * @param {number} budget - Orçamento total
 * @param {string} usage - Tipo de uso
 * @returns {Object} - Distribuição do orçamento por categoria
 */
function calculateBudgetDistribution(budget, usage) {
  // Copiar a distribuição padrão
  const distribution = { ...DEFAULT_BUDGET_DISTRIBUTION };
  
  // Aplicar ajustes baseados no tipo de uso
  if (usage) {
    // Normalizar o tipo de uso para minúsculas
    const normalizedUsage = usage.toLowerCase();
    
    // Verificar se há ajustes para este tipo de uso
    Object.keys(USAGE_ADJUSTMENTS).forEach(usageType => {
      if (normalizedUsage.includes(usageType)) {
        // Aplicar os ajustes para este tipo de uso
        Object.entries(USAGE_ADJUSTMENTS[usageType]).forEach(([category, adjustment]) => {
          distribution[category] += adjustment;
        });
      }
    });
  }
  
  // Normalizar para garantir que a soma seja 1
  const sum = Object.values(distribution).reduce((a, b) => a + b, 0);
  Object.keys(distribution).forEach(key => {
    distribution[key] = distribution[key] / sum;
  });
  
  // Calcular os valores monetários
  const result = {};
  Object.entries(distribution).forEach(([category, percentage]) => {
    result[category] = Math.round(budget * percentage);
  });
  
  return result;
}

/**
 * Encontra os componentes ótimos para cada categoria de acordo com o orçamento
 * @param {Object} budgetDistribution - Distribuição do orçamento por categoria
 * @param {Object} preferences - Preferências do usuário
 * @returns {Promise<Array>} - Lista de componentes otimizados
 */
async function findOptimalComponents(budgetDistribution, preferences) {
  try {
    // Array para armazenar as promessas de busca de componentes
    const componentPromises = [];
    
    // Para cada categoria, buscar o melhor componente
    for (const [category, categoryBudget] of Object.entries(budgetDistribution)) {
      // Verificar preferências para esta categoria
      const categoryPreferences = {};
      
      // Verificar preferências de marca
      if (preferences[`brand_${category.toLowerCase()}`]) {
        categoryPreferences.brand = preferences[`brand_${category.toLowerCase()}`];
      }
      
      // Adicionar a promessa de busca à lista
      componentPromises.push(
        componentService.findBestComponent(category, categoryBudget, categoryPreferences)
      );
    }
    
    // Aguardar todas as buscas de componentes
    const components = await Promise.all(componentPromises);
    
    return components;
  } catch (error) {
    logger.error('Erro ao buscar componentes ótimos:', error);
    throw new ApiError('Falha ao buscar os melhores componentes', 500);
  }
}