const db = require('../database');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Controlador para gerenciar Lojas (CRUD)
 */
const storesController = {
  /**
   * Listar todas as lojas
   */
  async getAll(req, res, next) {
    try {
      const { rows } = await db.query('SELECT * FROM stores ORDER BY priority ASC, name ASC');
      res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Buscar uma loja por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const { rows } = await db.query('SELECT * FROM stores WHERE id = $1', [id]);
      
      if (rows.length === 0) {
        throw ApiError.notFound('Loja não encontrada');
      }
      
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Criar uma nova loja
   */
  async create(req, res, next) {
    try {
      const { name, slug, base_url, logo_url, priority } = req.body;
      
      if (!name || !slug || !base_url) {
        throw ApiError.badRequest('Nome, slug e URL base são obrigatórios');
      }

      const queryText = `
        INSERT INTO stores (name, slug, base_url, logo_url, priority)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [name, slug, base_url, logo_url, priority || 0];
      
      const { rows } = await db.query(queryText, values);
      res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Atualizar uma loja
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, slug, base_url, logo_url, priority, is_active } = req.body;

      const { rows: check } = await db.query('SELECT id FROM stores WHERE id = $1', [id]);
      if (check.length === 0) throw ApiError.notFound('Loja não encontrada');

      const queryText = `
        UPDATE stores 
        SET name = COALESCE($1, name), 
            slug = COALESCE($2, slug), 
            base_url = COALESCE($3, base_url), 
            logo_url = COALESCE($4, logo_url), 
            priority = COALESCE($5, priority),
            is_active = COALESCE($6, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `;
      const values = [name, slug, base_url, logo_url, priority, is_active, id];
      
      const { rows } = await db.query(queryText, values);
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remover uma loja
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { rows } = await db.query('DELETE FROM stores WHERE id = $1 RETURNING id', [id]);
      
      if (rows.length === 0) {
        throw ApiError.notFound('Loja não encontrada');
      }
      
      res.json({ success: true, message: 'Loja removida com sucesso' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = storesController;
