const logger = require('../utils/logger');
const cacheService = require('./cacheService');
const db = require('../database');

/**
 * Servico simplificado para leitura exclusiva do banco local.
 * Toda logica de scraping foi removida.
 */
const componentService = {
  async findBestComponent(category, budget, preferences = {}) {
    try {
      const cacheKey = `component:${category}:${budget}:${JSON.stringify(preferences)}`;
      const cachedResult = cacheService.get(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      const queryText = `
        SELECT
          grupo AS category_name,
          peca AS category,
          modelo AS name,
          valor AS price,
          loja AS store_name,
          link AS product_url
        FROM "Home"
        WHERE peca ILIKE $1
          AND valor <= $2
        ORDER BY valor DESC, grupo_ordem ASC, ordem ASC
        LIMIT 1
      `;

      const { rows } = await db.query(queryText, [`%${category}%`, Number(budget) || 0]);

      if (rows.length > 0) {
        cacheService.set(cacheKey, rows[0]);
        return rows[0];
      }

      return {
        category_name: 'Home',
        category,
        name: `${category} nao encontrado`,
        price: 0,
        store_name: 'N/A',
        product_url: '#'
      };
    } catch (error) {
      logger.error(`Erro ao buscar melhor componente ${category}: ${error.message}`);
      throw error;
    }
  },

  async getComponentsByCategory(category, filters = {}) {
    try {
      const cacheKey = `components:${category}:${JSON.stringify(filters)}`;
      const cachedResult = cacheService.get(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      const params = [`%${category}%`];
      let queryText = `
        SELECT
          'Home' AS source_table,
          grupo,
          grupo_slug,
          ordem,
          peca,
          modelo,
          valor,
          parcelado,
          loja,
          link
        FROM "Home"
        WHERE peca ILIKE $1 OR grupo_slug = $1
      `;

      if (filters.maxPrice) {
        params.push(Number(filters.maxPrice) || 0);
        queryText += ` AND valor <= $${params.length}`;
      }

      queryText += ' ORDER BY valor ASC, grupo_ordem ASC, ordem ASC';

      const { rows } = await db.query(queryText, params);
      cacheService.set(cacheKey, rows);
      return rows;
    } catch (error) {
      logger.error(`Erro ao buscar componentes da categoria ${category}: ${error.message}`);
      throw error;
    }
  },

  async searchComponents(searchTerm, filters = {}) {
    try {
      const params = [`%${searchTerm}%`];
      const priceClause = filters.maxPrice ? ' AND valor <= $2' : '';

      if (filters.maxPrice) {
        params.push(Number(filters.maxPrice) || 0);
      }

      const queryText = `
        SELECT * FROM (
          SELECT 'Home' AS source_table, grupo, peca, modelo, valor, parcelado, loja, link
          FROM "Home"
          WHERE (modelo ILIKE $1 OR peca ILIKE $1 OR grupo ILIKE $1)${priceClause}
          UNION ALL
          SELECT 'Monitores' AS source_table, grupo, peca, modelo, valor, parcelado, loja, link
          FROM "Monitores"
          WHERE (modelo ILIKE $1 OR peca ILIKE $1 OR grupo ILIKE $1)${priceClause}
          UNION ALL
          SELECT 'Pcs_Usados' AS source_table, grupo, peca, modelo, valor, parcelado, loja, link
          FROM "Pcs_Usados"
          WHERE (modelo ILIKE $1 OR peca ILIKE $1 OR grupo ILIKE $1)${priceClause}
        ) items
        ORDER BY valor ASC, grupo ASC, modelo ASC
      `;

      return (await db.query(queryText, params)).rows;
    } catch (error) {
      logger.error(`Erro ao pesquisar componentes: ${error.message}`);
      throw error;
    }
  }
};

module.exports = componentService;
