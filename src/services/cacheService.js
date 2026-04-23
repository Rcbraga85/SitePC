const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Tempo padrão de expiração do cache em segundos (30 minutos)
const DEFAULT_TTL = process.env.CACHE_TTL || 1800;

// Inicialização do cache
const cache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: 120, // Verificar expiração a cada 2 minutos
  useClones: false  // Para melhor performance
});

/**
 * Serviço de cache para otimizar requisições repetidas
 */
const cacheService = {
  /**
   * Obtém um valor do cache
   * @param {string} key - Chave do cache
   * @returns {any} - Valor armazenado ou undefined se não existir
   */
  get(key) {
    const value = cache.get(key);
    if (value) {
      logger.debug(`Cache hit: ${key}`);
    } else {
      logger.debug(`Cache miss: ${key}`);
    }
    return value;
  },

  /**
   * Armazena um valor no cache
   * @param {string} key - Chave do cache
   * @param {any} value - Valor a ser armazenado
   * @param {number} ttl - Tempo de vida em segundos (opcional)
   * @returns {boolean} - true se armazenado com sucesso
   */
  set(key, value, ttl = DEFAULT_TTL) {
    logger.debug(`Armazenando em cache: ${key}`);
    return cache.set(key, value, ttl);
  },

  /**
   * Remove um valor do cache
   * @param {string} key - Chave do cache
   * @returns {number} - Número de itens removidos
   */
  del(key) {
    logger.debug(`Removendo do cache: ${key}`);
    return cache.del(key);
  },

  /**
   * Limpa todo o cache
   * @returns {void}
   */
  flush() {
    logger.info('Limpando todo o cache');
    cache.flushAll();
  },

  /**
   * Obtém estatísticas do cache
   * @returns {Object} - Estatísticas do cache
   */
  getStats() {
    return cache.getStats();
  },

  /**
   * Função auxiliar para implementar cache em funções assíncronas
   * @param {Function} fn - Função a ser cacheada
   * @param {string} keyPrefix - Prefixo para a chave do cache
   * @param {number} ttl - Tempo de vida em segundos (opcional)
   * @returns {Function} - Função com cache
   */
  async withCache(fn, keyPrefix, ttl = DEFAULT_TTL) {
    return async (...args) => {
      // Criar chave baseada nos argumentos
      const key = `${keyPrefix}:${JSON.stringify(args)}`;
      
      // Verificar cache
      const cachedValue = this.get(key);
      if (cachedValue) return cachedValue;
      
      // Executar função e armazenar resultado
      const result = await fn(...args);
      this.set(key, result, ttl);
      
      return result;
    };
  }
};

module.exports = cacheService;