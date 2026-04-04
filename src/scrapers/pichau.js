const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const validator = require('../utils/validator');
const { ApiError } = require('../middleware/errorHandler');

// URL base da loja
const BASE_URL = 'https://www.pichau.com.br';

// Headers para simular um navegador
const headers = {
  'User-Agent': process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
};

/**
 * Módulo de scraping para a loja Pichau
 */
const pichau = {
  /**
   * Busca produtos por categoria
   * @param {string} category - Categoria de componentes (CPU, GPU, etc)
   * @param {Object} filters - Filtros adicionais (marca, preço máximo, etc)
   * @returns {Promise<Array>} - Lista de produtos encontrados
   */
  async searchByCategory(category, filters = {}) {
    try {
      // Mapear categoria para URL da Pichau
      const categoryUrl = mapCategoryToUrl(category);
      
      // Construir URL com filtros
      let url = `${BASE_URL}/${categoryUrl}`;
      
      logger.debug(`Buscando produtos na Pichau: ${url}`);
      
      // Fazer requisição HTTP
      const response = await axios.get(url, { headers });
      
      // Extrair produtos da página
      const products = extractProductsFromHtml(response.data, category);
      
      // Filtrar por preço máximo se especificado
      if (filters.maxPrice && filters.maxPrice > 0) {
        return products.filter(product => product.price <= filters.maxPrice);
      }
      
      return products;
    } catch (error) {
      logger.error(`Erro ao buscar produtos na Pichau: ${error.message}`);
      throw new ApiError(`Falha ao buscar produtos na Pichau: ${error.message}`, 500);
    }
  },
  
  /**
   * Busca produtos por termo de pesquisa
   * @param {string} term - Termo de pesquisa
   * @param {Object} filters - Filtros adicionais (opcional)
   * @returns {Promise<Array>} - Lista de produtos encontrados
   */
  async searchByTerm(term, filters = {}) {
    try {
      if (!term || term.length < 3) {
        throw new ApiError('O termo de busca deve ter pelo menos 3 caracteres', 400);
      }
      
      const url = `${BASE_URL}/busca?q=${encodeURIComponent(term)}`;
      logger.debug(`Buscando produtos na Pichau com o termo "${term}": ${url}`);
      
      const response = await axios.get(url, { headers });
      const products = extractProductsFromHtml(response.data);
      
      // Aplicar filtros
      let filteredProducts = products;
      
      if (filters.maxPrice && filters.maxPrice > 0) {
        filteredProducts = filteredProducts.filter(product => product.price <= filters.maxPrice);
      }
      
      if (filters.category) {
        filteredProducts = filteredProducts.filter(product => 
          product.category === filters.category || detectCategory(product.name) === filters.category
        );
      }
      
      logger.info(`Encontrados ${filteredProducts.length} produtos na Pichau com o termo "${term}"`);
      return filteredProducts;
    } catch (error) {
      logger.error(`Erro ao buscar produtos na Pichau com o termo "${term}": ${error.message}`);
      throw new ApiError(`Falha ao buscar produtos na Pichau: ${error.message}`, 500);
    }
  },
  
  /**
   * Busca detalhes de um produto específico
   * @param {string} url - URL do produto
   * @returns {Promise<Object>} - Detalhes do produto
   */
  async getProductDetails(url) {
    try {
      logger.debug(`Buscando detalhes do produto na Pichau: ${url}`);
      
      // Fazer requisição HTTP
      const response = await axios.get(url, { headers });
      
      // Extrair detalhes do produto
      return extractProductDetails(response.data, url);
    } catch (error) {
      logger.error(`Erro ao buscar detalhes do produto na Pichau: ${error.message}`);
      throw new ApiError(`Falha ao buscar detalhes do produto: ${error.message}`, 500);
    }
  }
};

/**
 * Mapeia categorias para URLs da Pichau
 */
function mapCategoryToUrl(category) {
  const categoryMap = {
    'processador': 'hardware/processadores',
    'placa-de-video': 'hardware/placa-de-video',
    'memoria-ram': 'hardware/memorias',
    'armazenamento': 'hardware/ssd',
    'placa-mae': 'hardware/placa-mae',
    'fonte': 'hardware/fontes',
    'gabinete': 'hardware/gabinetes',
    'cooler': 'hardware/coolers',
    'watercooler': 'hardware/water-cooler',
    // Mapeamento alternativo para compatibilidade
    'CPU': 'hardware/processadores',
    'GPU': 'hardware/placa-de-video',
    'RAM': 'hardware/memorias',
    'STORAGE': 'hardware/ssd',
    'MOTHERBOARD': 'hardware/placa-mae',
    'PSU': 'hardware/fontes',
    'CASE': 'hardware/gabinetes'
  };
  
  return categoryMap[category] || 'hardware';
}

/**
 * Extrai produtos da página HTML
 */
function extractProductsFromHtml(html, category = '') {
  try {
    const $ = cheerio.load(html);
    const products = [];
    
    // Seletor para os cards de produtos (atualizado para o layout atual da Pichau)
    $('.MuiGrid-item').each((index, element) => {
      try {
        // Extrair informações básicas
        const name = $(element).find('h2').text().trim();
        const url = $(element).find('a').attr('href');
        const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
        const imageUrl = $(element).find('img').attr('src');
        
        // Extrair preço (formato atualizado)
        let priceText = $(element).find('.jss87').text().trim();
        if (!priceText) {
          priceText = $(element).find('[data-testid="product-card-price-value"]').text().trim();
        }
        
        // Limpar e converter o preço
        priceText = priceText.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        const price = parseFloat(priceText) || 0;
        
        // Extrair ID do produto da URL
        const productId = url.split('/').pop();
        
        // Adicionar produto à lista se tiver nome e preço
        if (name && price > 0) {
          // Validar produto antes de adicionar à lista
          const validatedProduct = validator.validateProduct({
            id: productId,
            name,
            price,
            productUrl: fullUrl,
            imageUrl,
            store: 'Pichau',
            category: category || detectCategory(name)
          }, 'https://www.pichau.com.br');
          
          products.push(validatedProduct);
        }
      } catch (err) {
        logger.warn(`Erro ao extrair produto da Pichau: ${err.message}`);
      }
    });
    
    return products;
  } catch (error) {
    logger.error(`Erro ao extrair produtos da página HTML: ${error.message}`);
    return [];
  }
}

/**
 * Extrai detalhes completos de um produto
 */
function extractProductDetails(html, url) {
  try {
    const $ = cheerio.load(html);
    
    // Extrair nome do produto (seletor atualizado)
    const name = $('h1[data-testid="product-title"]').text().trim();
    
    // Extrair preço à vista (seletor atualizado)
    let priceText = $('[data-testid="product-price-value"]').text().trim();
    if (!priceText) {
      priceText = $('.jss87').text().trim();
    }
    
    // Limpar e converter o preço
    priceText = priceText.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    const price = parseFloat(priceText) || 0;
    
    // Extrair preço parcelado (seletor atualizado)
    let installmentPrice = price;
    let installmentText = $('[data-testid="product-installments"]').text().trim();
    
    if (installmentText) {
      const match = installmentText.match(/(\d+)x de R\$\s*([\d.,]+)/);
      if (match && match.length >= 3) {
        const installments = parseInt(match[1]);
        const installmentValue = parseFloat(match[2].replace('.', '').replace(',', '.'));
        installmentPrice = installments * installmentValue;
      }
    }
    
    // Extrair imagem (seletor atualizado)
    const imageUrl = $('img[data-testid="product-image"]').attr('src');
    
    // Extrair especificações
    const specs = {};
    $('[data-testid="product-specifications"] tr').each((index, element) => {
      const key = $(element).find('th').text().trim();
      const value = $(element).find('td').text().trim();
      if (key && value) {
        specs[key] = value;
      }
    });
    
    // Extrair ID do produto da URL
    const productId = url.split('/').pop();
    
    return {
      id: productId,
      name,
      price,
      installmentPrice,
      productUrl: url,
      imageUrl,
      specs,
      store: 'Pichau',
      category: detectCategory(name),
      inStock: !$('[data-testid="product-unavailable"]').length
    };
  } catch (error) {
    logger.error(`Erro ao extrair detalhes do produto: ${error.message}`);
    throw new ApiError(`Falha ao extrair detalhes do produto: ${error.message}`, 500);
  }
}

/**
 * Detecta a categoria do produto com base no nome
 */
function detectCategory(productName) {
  const name = productName.toLowerCase();
  
  if (name.includes('processador') || name.includes('ryzen') || name.includes('intel') || name.includes('core i')) {
    return 'processador';
  } else if (name.includes('placa de vídeo') || name.includes('geforce') || name.includes('radeon') || name.includes('rtx')) {
    return 'placa-de-video';
  } else if (name.includes('memória') || name.includes('ram') || name.includes('ddr')) {
    return 'memoria-ram';
  } else if (name.includes('ssd') || name.includes('hd') || name.includes('nvme') || name.includes('m.2')) {
    return 'armazenamento';
  } else if (name.includes('placa mãe') || name.includes('placa-mãe') || name.includes('motherboard')) {
    return 'placa-mae';
  } else if (name.includes('fonte') || name.includes('power supply')) {
    return 'fonte';
  } else if (name.includes('gabinete') || name.includes('case')) {
    return 'gabinete';
  } else if (name.includes('cooler') && !name.includes('water')) {
    return 'cooler';
  } else if (name.includes('water cooler') || name.includes('watercooler') || name.includes('liquid cooling')) {
    return 'watercooler';
  } else {
    return 'outros';
  }
}

module.exports = pichau;