const db = require('../database');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Controlador para gerenciar Categorias (CRUD)
 */
const categoriesController = {
  /**
   * Listar todas as categorias
   */
  async getAll(req, res, next) {
    try {
      const { rows } = await db.query('SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC, name_pt ASC');
      res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Buscar uma categoria por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const { rows } = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
      
      if (rows.length === 0) {
        throw ApiError.notFound('Categoria não encontrada');
      }
      
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Criar uma nova categoria
   */
  async create(req, res, next) {
    try {
      const { code, name, name_pt, description, icon, sort_order } = req.body;
      
      if (!code || !name || !name_pt) {
        throw ApiError.badRequest('Código, nome e nome em português são obrigatórios');
      }

      const queryText = `
        INSERT INTO categories (code, name, name_pt, description, icon, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const values = [code, name, name_pt, description, icon, sort_order || 0];
      
      const { rows } = await db.query(queryText, values);
      res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Atualizar uma categoria
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { code, name, name_pt, description, icon, sort_order, is_active } = req.body;

      const { rows: check } = await db.query('SELECT id FROM categories WHERE id = $1', [id]);
      if (check.length === 0) throw ApiError.notFound('Categoria não encontrada');

      const queryText = `
        UPDATE categories 
        SET code = COALESCE($1, code), 
            name = COALESCE($2, name), 
            name_pt = COALESCE($3, name_pt), 
            description = COALESCE($4, description), 
            icon = COALESCE($5, icon), 
            sort_order = COALESCE($6, sort_order),
            is_active = COALESCE($7, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;
      const values = [code, name, name_pt, description, icon, sort_order, is_active, id];
      
      const { rows } = await db.query(queryText, values);
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remover uma categoria
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { rows } = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
      
      if (rows.length === 0) {
        throw ApiError.notFound('Categoria não encontrada');
      }
      
      res.json({ success: true, message: 'Categoria removida com sucesso' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = categoriesController;
