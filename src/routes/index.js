const express = require('express');
const router = express.Router();

// Importação dos controladores de rotas
const buildController = require('../controllers/buildController');
const componentsController = require('../controllers/componentsController');
const searchController = require('../controllers/searchController');
const pricesController = require('../controllers/pricesController');
const recommendationsController = require('../controllers/recommendationsController');

// Rota de status do servidor
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor funcionando corretamente' });
});

// Rotas principais
router.post('/build', buildController.createBuild);
router.get('/components', componentsController.getCategories);
router.get('/components/:category', componentsController.getComponentsByCategory);
router.get('/search', searchController.searchComponents);
router.get('/prices/:componentId', pricesController.comparePrice);
router.get('/recommendations', recommendationsController.getRecommendations);

module.exports = router;