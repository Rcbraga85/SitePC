const express = require('express');
const router = express.Router();

const buildController = require('../controllers/buildController');
const componentsController = require('../controllers/componentsController');
const searchController = require('../controllers/searchController');
const pricesController = require('../controllers/pricesController');
const recommendationsController = require('../controllers/recommendationsController');
const storesController = require('../controllers/storesController');
const categoriesController = require('../controllers/categoriesController');
const siteDataController = require('../controllers/siteDataController');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Retorna o status do servidor
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Servidor funcionando corretamente
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor funcionando corretamente' });
});

router.get('/site-data/home', siteDataController.getHome);
router.get('/site-data/monitores', siteDataController.getMonitors);
router.get('/site-data/pcs-usados', siteDataController.getUsedPcs);
router.get('/site-data/tutorials', siteDataController.getTutorials);
router.post('/site-data/admin/update-used-metrics', siteDataController.adminUpdateUsedMetrics);

// --- Rotas de Lojas (Stores) ---

/**
 * @swagger
 * /stores:
 *   get:
 *     summary: Lista todas as lojas
 *     tags: [Lojas]
 *     responses:
 *       200:
 *         description: Lista de lojas
 */
router.get('/stores', storesController.getAll);

/**
 * @swagger
 * /stores/{id}:
 *   get:
 *     summary: Busca uma loja pelo ID
 *     tags: [Lojas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalhes da loja
 */
router.get('/stores/:id', storesController.getById);

/**
 * @swagger
 * /stores:
 *   post:
 *     summary: Cria uma nova loja
 *     tags: [Lojas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Store'
 *     responses:
 *       201:
 *         description: Loja criada
 */
router.post('/stores', storesController.create);

/**
 * @swagger
 * /stores/{id}:
 *   put:
 *     summary: Atualiza uma loja existente
 *     tags: [Lojas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Store'
 *     responses:
 *       200:
 *         description: Loja atualizada
 */
router.put('/stores/:id', storesController.update);

/**
 * @swagger
 * /stores/{id}:
 *   delete:
 *     summary: Remove uma loja
 *     tags: [Lojas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Loja removida
 */
router.delete('/stores/:id', storesController.delete);

// --- Rotas de Categorias (Categories) ---

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lista todas as categorias
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/categories', categoriesController.getAll);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Busca uma categoria pelo ID
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalhes da categoria
 */
router.get('/categories/:id', categoriesController.getById);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categorias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Categoria criada
 */
router.post('/categories', categoriesController.create);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Categoria atualizada
 */
router.put('/categories/:id', categoriesController.update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Remove uma categoria
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Categoria removida
 */
router.delete('/categories/:id', categoriesController.delete);

// --- Rotas de Componentes (Components) ---

/**
 * @swagger
 * /components:
 *   get:
 *     summary: Lista categorias de componentes (ativo)
 *     tags: [Componentes]
 */
router.get('/components', componentsController.getCategories);

/**
 * @swagger
 * /components/{category}:
 *   get:
 *     summary: Lista componentes por categoria (ID ou Código)
 *     tags: [Componentes]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/components/:category', componentsController.getComponentsByCategory);

/**
 * @swagger
 * /components:
 *   post:
 *     summary: Cria um novo componente
 *     tags: [Componentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Component'
 */
router.post('/components', componentsController.create);

/**
 * @swagger
 * /components/{id}:
 *   put:
 *     summary: Atualiza um componente
 *     tags: [Componentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
router.put('/components/:id', componentsController.update);

/**
 * @swagger
 * /components/{id}:
 *   delete:
 *     summary: Remove um componente
 *     tags: [Componentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
router.delete('/components/:id', componentsController.delete);

// --- Outras Rotas ---

/**
 * @swagger
 * /build:
 *   post:
 *     summary: Gera uma build otimizada de PC
 *     tags: [Build]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               budget: { type: 'number' }
 *               usage: { type: 'string' }
 *               preferences: { type: 'object' }
 */
router.post('/build', buildController.createBuild);

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Pesquisa componentes por texto
 *     tags: [Busca]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: 'string' }
 */
router.get('/search', searchController.searchComponents);

/**
 * @swagger
 * /prices/{componentId}:
 *   get:
 *     summary: Compara preços de um componente
 *     tags: [Preços]
 */
router.get('/prices/:componentId', pricesController.comparePrice);

/**
 * @swagger
 * /recommendations:
 *   get:
 *     summary: Sugere upgrades de hardware
 *     tags: [Recomendações]
 */
router.get('/recommendations', recommendationsController.getRecommendations);

module.exports = router;
