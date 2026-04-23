const db = require('../database');
const { ApiError } = require('../middleware/errorHandler');
const componentService = require('../services/componentService');
const logger = require('../utils/logger');

/**
 * Controlador para gerenciar componentes de PC
 */
const componentsController = {
  /**
   * Listar todas as categorias (do banco)
   */
  async getCategories(req, res, next) {
    try {
      const { rows } = await db.query('SELECT * FROM categories WHERE is_active = true ORDER BY sort_order');
      return res.status(200).json({ success: true, categories: rows });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Buscar componentes por categoria (do banco)
   */
  async getComponentsByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const { rows } = await db.query(`
        SELECT c.*, s.name as store_name 
        FROM components c
        JOIN stores s ON c.store_id = s.id
        JOIN categories cat ON c.category_id = cat.id
        WHERE (cat.code = $1 OR cat.id::text = $1) AND c.is_active = true
        ORDER BY c.price ASC
      `, [category]);
      
      return res.status(200).json({ 
        success: true, 
        category,
        count: rows.length,
        components: rows 
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Criar um novo componente
   */
  async create(req, res, next) {
    try {
      const { name, price, store_id, category_id, product_url, image_url, brand, specifications } = req.body;
      
      if (!name || !price || !store_id || !category_id || !product_url) {
        throw ApiError.badRequest('Campos obrigatórios ausentes');
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const queryText = `
        INSERT INTO components (name, slug, price, store_id, category_id, product_url, image_url, brand, specifications)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [name, slug, price, store_id, category_id, product_url, image_url, brand, specifications || {}];
      
      const { rows } = await db.query(queryText, values);
      res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Atualizar um componente
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, price, store_id, category_id, product_url, image_url, brand, specifications, in_stock, is_active } = req.body;

      const { rows: check } = await db.query('SELECT id FROM components WHERE id = $1', [id]);
      if (check.length === 0) throw ApiError.notFound('Componente não encontrado');

      const queryText = `
        UPDATE components 
        SET name = COALESCE($1, name), 
            price = COALESCE($2, price), 
            store_id = COALESCE($3, store_id), 
            category_id = COALESCE($4, category_id), 
            product_url = COALESCE($5, product_url), 
            image_url = COALESCE($6, image_url), 
            brand = COALESCE($7, brand),
            specifications = COALESCE($8, specifications),
            in_stock = COALESCE($9, in_stock),
            is_active = COALESCE($10, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      `;
      const values = [name, price, store_id, category_id, product_url, image_url, brand, specifications, in_stock, is_active, id];
      
      const { rows } = await db.query(queryText, values);
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remover um componente
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { rows } = await db.query('DELETE FROM components WHERE id = $1 RETURNING id', [id]);
      
      if (rows.length === 0) {
        throw ApiError.notFound('Componente não encontrado');
      }
      
      res.json({ success: true, message: 'Componente removido com sucesso' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = componentsController;