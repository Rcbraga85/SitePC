const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const terabyteShop = require('../scrapers/terabyteShop');
const pichau = require('../scrapers/pichau');
const cacheService = require('./cacheService');
const validator = require('../utils/validator');

/**
 * Serviço para gerenciar componentes de PC
 */
const componentService = {
  /**
   * Busca o melhor componente de uma categoria dentro do orçamento
   * @param {string} category - Categoria do componente (CPU, GPU, etc)
   * @param {number} budget - Orçamento máximo para o componente
   * @param {Object} preferences - Preferências do usuário (marca, etc)
   * @returns {Promise<Object>} - Melhor componente encontrado
   */
  async findBestComponent(category, budget, preferences = {}) {
    try {
      // Verificar cache
      const cacheKey = `component:${category}:${budget}:${JSON.stringify(preferences)}`;
      const cachedResult = cacheService.get(cacheKey);
      
      if (cachedResult) {
        logger.info(`Retornando componente em cache para ${category} com orçamento R$ ${budget}`);
        return cachedResult;
      }

      logger.info(`Buscando melhor ${category} com orçamento R$ ${budget}`);
      
      // Buscar componentes de todas as lojas em paralelo
      const [terabyteComponents, pichauComponents] = await Promise.all([
        terabyteShop.searchByCategory(category, { maxPrice: budget, ...preferences }),
        pichau.searchByCategory(category, { maxPrice: budget, ...preferences })
      ]);
      
      // Combinar resultados de todas as lojas
      const allComponents = [...terabyteComponents, ...pichauComponents];
      
      // Filtrar componentes dentro do orçamento
      const affordableComponents = allComponents.filter(comp => comp.price <= budget);
      
      if (affordableComponents.length === 0) {
        logger.warn(`Nenhum componente ${category} encontrado dentro do orçamento R$ ${budget}`);
        throw new ApiError(`Nenhum componente ${category} encontrado dentro do orçamento`, 404);
      }
      
      // Ordenar por preço (decrescente) para obter o melhor custo-benefício dentro do orçamento
      affordableComponents.sort((a, b) => b.price - a.price);
      
      // Selecionar o melhor componente (o mais caro dentro do orçamento)
      const bestComponent = affordableComponents[0];
      
      // Armazenar em cache
      cacheService.set(cacheKey, bestComponent);
      
      return bestComponent;
    } catch (error) {
      logger.error(`Erro ao buscar melhor componente ${category}: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Obtém todas as categorias de componentes disponíveis
   * @returns {Array} - Lista de categorias
   */
  getCategories() {
    return [
      { id: 'CPU', name: 'Processador' },
      { id: 'GPU', name: 'Placa de Vídeo' },
      { id: 'RAM', name: 'Memória RAM' },
      { id: 'STORAGE', name: 'Armazenamento' },
      { id: 'MOTHERBOARD', name: 'Placa-mãe' },
      { id: 'PSU', name: 'Fonte de Alimentação' },
      { id: 'CASE', name: 'Gabinete' }
    ];
  },
  
  /**
   * Busca componentes por categoria
   * @param {string} category - Categoria dos componentes
   * @param {Object} filters - Filtros adicionais
   * @returns {Promise<Array>} - Lista de componentes
   */
  async getComponentsByCategory(category, filters = {}) {
    try {
      // Verificar cache
      const cacheKey = `components:${category}:${JSON.stringify(filters)}`;
      const cachedResult = cacheService.get(cacheKey);
      
      if (cachedResult) {
        return cachedResult;
      }

      // Buscar componentes de todas as lojas em paralelo
      const [terabyteComponents, pichauComponents] = await Promise.all([
        terabyteShop.searchByCategory(category, filters),
        pichau.searchByCategory(category, filters)
      ]);
      
      // Combinar resultados
      const components = [...terabyteComponents, ...pichauComponents];
      
      // Armazenar em cache
      cacheService.set(cacheKey, components);
      
      return components;
    } catch (error) {
      logger.error(`Erro ao buscar componentes da categoria ${category}: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Busca componentes por termo de pesquisa
   * @param {string} searchTerm - Termo de pesquisa
   * @param {Object} filters - Filtros adicionais
   * @returns {Promise<Array>} - Lista de componentes
   */
  async searchComponents(searchTerm, filters = {}) {
    try {
      // Implementação básica de busca
      // Em uma implementação real, seria necessário buscar em todas as lojas
      
      // Buscar na Terabyte apenas como exemplo
      const components = await terabyteShop.searchByTerm(searchTerm, filters);
      
      return components;
    } catch (error) {
      logger.error(`Erro ao pesquisar componentes: ${error.message}`);
      throw error;
    }
  }
};

module.exports = componentService;