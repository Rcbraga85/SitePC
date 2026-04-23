const db = require('../database');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Controlador de comparacao sem scraping.
 * Consulta apenas o banco local.
 */
exports.comparePrice = async (req, res, next) => {
  try {
    const { name } = req.query;

    if (!name) {
      throw ApiError.badRequest('E necessario fornecer o nome para comparacao');
    }

    const { rows } = await db.query(`
      SELECT grupo, modelo AS name, valor AS price, parcelado, loja AS store, link AS url
      FROM (
        SELECT grupo, modelo, valor, parcelado, loja, link FROM "Home"
        UNION ALL
        SELECT grupo, modelo, valor, parcelado, loja, link FROM "Monitores"
        UNION ALL
        SELECT grupo, modelo, valor, parcelado, loja, link FROM "Pcs_Usados"
      ) items
      WHERE modelo ILIKE $1
      ORDER BY valor ASC, loja ASC
    `, [`%${name}%`]);

    return res.status(200).json({
      success: true,
      name,
      results: rows
    });
  } catch (error) {
    next(error);
  }
};
