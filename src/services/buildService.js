const logger = require('../utils/logger');
const cacheService = require('./cacheService');
const db = require('../database');

exports.createOptimalBuild = async (budget) => {
  try {
    const numericBudget = Number(budget) || 0;
    const cacheKey = `build:${numericBudget}`;
    const cachedResult = cacheService.get(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const { rows } = await db.query(`
      SELECT
        grupo,
        grupo_slug,
        grupo_ordem,
        badge,
        imagem,
        fps,
        custo_frame,
        SUM(valor) AS total
      FROM "Home"
      GROUP BY grupo, grupo_slug, grupo_ordem, badge, imagem, fps, custo_frame
      ORDER BY ABS(SUM(valor) - $1), grupo_ordem ASC
      LIMIT 1
    `, [numericBudget]);

    if (rows.length === 0) {
      return { total: '0.00', components: [] };
    }

    const selectedGroup = rows[0];

    const components = (await db.query(`
      SELECT
        peca AS category_name,
        peca AS category,
        modelo AS name,
        valor AS price,
        loja AS store_name,
        link AS product_url
      FROM "Home"
      WHERE grupo_slug = $1
      ORDER BY ordem ASC
    `, [selectedGroup.grupo_slug])).rows;

    const result = {
      total: Number(selectedGroup.total || 0).toFixed(2),
      group: selectedGroup.grupo,
      components
    };

    cacheService.set(cacheKey, result);
    return result;
  } catch (error) {
    logger.error('Erro ao montar build a partir do banco local:', error);
    throw error;
  }
};
