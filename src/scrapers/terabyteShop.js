/**
 * Módulo de scraping para a loja Terabyte
 * Responsável por buscar produtos e detalhes de produtos na Terabyte
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const validator = require('../utils/validator');

// Configuração do User-Agent para evitar bloqueios
const config = {
  headers: {
    'User-Agent': process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

// Mapeamento de categorias para URLs da Terabyte
const categoryUrls = {
  'processador': 'https://www.terabyteshop.com.br/hardware/processadores',
  'placa-mae': 'https://www.terabyteshop.com.br/hardware/placas-mae',
  'placa-de-video': 'https://www.terabyteshop.com.br/hardware/placas-de-video',
  'memoria-ram': 'https://www.terabyteshop.com.br/hardware/memorias',
  'armazenamento': 'https://www.terabyteshop.com.br/hardware/ssd-2-5',
  'fonte': 'https://www.terabyteshop.com.br/hardware/fontes',
  'gabinete': 'https://www.terabyteshop.com.br/hardware/gabinetes',
  'cooler': 'https://www.terabyteshop.com.br/hardware/coolers',
  'watercooler': 'https://www.terabyteshop.com.br/hardware/water-cooler'
};

/**
 * Busca produtos por categoria na Terabyte
 * @param {string} category - Categoria do produto
 * @param {Object} filters - Filtros adicionais (opcional)
 * @returns {Promise<Array>} - Lista de produtos encontrados
 */
async function searchByCategory(category, filters = {}) {
  try {
    if (!categoryUrls[category]) {
      logger.warn(`Categoria não suportada: ${category}`);
      return [];
    }

    const url = categoryUrls[category];
    logger.info(`Buscando produtos na categoria ${category} na Terabyte: ${url}`);
    
    const response = await axios.get(url, config);
    const $ = cheerio.load(response.data);
    
    const products = [];
    
    // Seletor para os produtos na página da Terabyte
    $('.pbox').each((i, element) => {
      try {
        const name = $(element).find('.prod-name').text().trim();
        const priceText = $(element).find('.prod-new-price').text().trim();
        const price = parseFloat(priceText.replace('R$', '').replace('.', '').replace(',', '.').trim());
        const imageUrl = $(element).find('.commerce_columns_item_image img').attr('src');
        const productUrl = $(element).find('.commerce_columns_item_inner > a').attr('href');
        const productId = productUrl.split('/').pop();
        
        // Aplicar filtros se necessário
        if (filters.maxPrice && price > filters.maxPrice) {
          return;
        }
        
        if (filters.searchTerm && !name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
          return;
        }
        
        // Validar produto antes de adicionar à lista
        const validatedProduct = validator.validateProduct({
          id: productId,
          name,
          price,
          imageUrl,
          productUrl,
          store: 'Terabyte',
          category
        }, 'https://www.terabyteshop.com.br');
        
        products.push(validatedProduct);
      } catch (err) {
        logger.error(`Erro ao extrair dados do produto: ${err.message}`);
      }
    });
    
    logger.info(`Encontrados ${products.length} produtos na categoria ${category} na Terabyte`);
    return products;
  } catch (error) {
    logger.error(`Erro ao buscar produtos na categoria ${category} na Terabyte: ${error.message}`);
    return [];
  }
}

/**
 * Obtém detalhes de um produto específico na Terabyte
 * @param {string} productId - ID do produto
 * @returns {Promise<Object>} - Detalhes do produto
 */
async function getProductDetails(productId) {
  try {
    const url = `https://www.terabyteshop.com.br/produto/${productId}`;
    logger.info(`Buscando detalhes do produto ${productId} na Terabyte: ${url}`);
    
    const response = await axios.get(url, config);
    const $ = cheerio.load(response.data);
    
    const name = $('.tit-prod').text().trim();
    const priceText = $('.val-prod.valVista').text().trim();
    const price = parseFloat(priceText.replace('R$', '').replace('.', '').replace(',', '.').trim());
    const imageUrl = $('.imgProduto').attr('src');
    const description = $('.tab-pane.active').text().trim();
    
    // Extrair especificações técnicas
    const specs = {};
    $('.tab-pane.active table tr').each((i, element) => {
      const key = $(element).find('td:first-child').text().trim();
      const value = $(element).find('td:last-child').text().trim();
      if (key && value) {
        specs[key] = value;
      }
    });
    
    // Detectar categoria com base no nome e descrição
    const category = detectCategory(name, description);
    
    return {
      id: productId,
      name,
      price,
      imageUrl,
      productUrl: url,
      description,
      specs,
      store: 'Terabyte',
      category,
      inStock: $('.indisponivel').length === 0
    };
  } catch (error) {
    logger.error(`Erro ao buscar detalhes do produto ${productId} na Terabyte: ${error.message}`);
    return null;
  }
}

/**
 * Busca produtos por termo de pesquisa na Terabyte
 * @param {string} term - Termo de pesquisa
 * @param {Object} filters - Filtros adicionais (opcional)
 * @returns {Promise<Array>} - Lista de produtos encontrados
 */
async function searchByTerm(term, filters = {}) {
  try {
    const url = `https://www.terabyteshop.com.br/busca?str=${encodeURIComponent(term)}`;
    logger.info(`Buscando produtos com o termo "${term}" na Terabyte: ${url}`);
    
    const response = await axios.get(url, config);
    const $ = cheerio.load(response.data);
    
    const products = [];
    
    // Seletor para os produtos na página de resultados da Terabyte
    $('.pbox').each((i, element) => {
      try {
        const name = $(element).find('.prod-name').text().trim();
        const priceText = $(element).find('.prod-new-price').text().trim();
        const price = parseFloat(priceText.replace('R$', '').replace('.', '').replace(',', '.').trim());
        const imageUrl = $(element).find('.commerce_columns_item_image img').attr('src');
        const productUrl = $(element).find('.commerce_columns_item_inner > a').attr('href');
        const productId = productUrl.split('/').pop();
        
        // Aplicar filtros se necessário
        if (filters.maxPrice && price > filters.maxPrice) {
          return;
        }
        
        if (filters.category) {
          const category = detectCategory(name, '');
          if (category !== filters.category) {
            return;
          }
        }
        
        products.push({
          id: productId,
          name,
          price,
          imageUrl,
          productUrl,
          store: 'Terabyte',
          category: detectCategory(name, '')
        });
      } catch (err) {
        logger.error(`Erro ao extrair dados do produto: ${err.message}`);
      }
    });
    
    logger.info(`Encontrados ${products.length} produtos com o termo "${term}" na Terabyte`);
    return products;
  } catch (error) {
    logger.error(`Erro ao buscar produtos com o termo "${term}" na Terabyte: ${error.message}`);
    return [];
  }
}

/**
 * Detecta a categoria de um produto com base no nome e descrição
 * @param {string} name - Nome do produto
 * @param {string} description - Descrição do produto
 * @returns {string} - Categoria detectada
 */
function detectCategory(name, description) {
  const text = (name + ' ' + description).toLowerCase();
  
  if (text.includes('processador') || text.includes('intel') || text.includes('amd') || text.includes('ryzen') || text.includes('core i')) {
    return 'processador';
  }
  
  if (text.includes('placa mãe') || text.includes('placa-mãe') || text.includes('motherboard')) {
    return 'placa-mae';
  }
  
  if (text.includes('placa de vídeo') || text.includes('placa-de-vídeo') || text.includes('gpu') || text.includes('geforce') || text.includes('radeon')) {
    return 'placa-de-video';
  }
  
  if (text.includes('memória') || text.includes('ram') || text.includes('ddr4') || text.includes('ddr5')) {
    return 'memoria-ram';
  }
  
  if (text.includes('ssd') || text.includes('hd') || text.includes('nvme') || text.includes('m.2')) {
    return 'armazenamento';
  }
  
  if (text.includes('fonte') || text.includes('psu') || text.includes('power supply')) {
    return 'fonte';
  }
  
  if (text.includes('gabinete') || text.includes('case')) {
    return 'gabinete';
  }
  
  if (text.includes('cooler') && !text.includes('water')) {
    return 'cooler';
  }
  
  if (text.includes('water cooler') || text.includes('watercooler') || text.includes('liquid cooling')) {
    return 'watercooler';
  }
  
  return 'outros';
}

module.exports = {
  searchByCategory,
  getProductDetails,
  searchByTerm
};