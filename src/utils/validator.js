/**
 * Utilitário para validação de dados
 * Responsável por validar URLs, preços e outros dados importantes
 */

const logger = require('./logger');

/**
 * Valida uma URL para garantir que seja completa e válida
 * @param {string} url - URL a ser validada
 * @param {string} baseUrl - URL base para completar URLs relativas
 * @returns {string} - URL validada e completa
 */
function validateUrl(url, baseUrl = '') {
  if (!url) {
    return '';
  }

  try {
    // Verifica se a URL já é absoluta
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Se for uma URL relativa, adiciona a URL base
    if (url.startsWith('/')) {
      // Remove a barra inicial se a baseUrl terminar com barra
      if (baseUrl.endsWith('/')) {
        return baseUrl + url.substring(1);
      }
      return baseUrl + url;
    }

    // Se não começar com barra, adiciona a barra
    if (baseUrl.endsWith('/')) {
      return baseUrl + url;
    }
    return baseUrl + '/' + url;
  } catch (error) {
    logger.error(`Erro ao validar URL: ${error.message}`);
    return '';
  }
}

/**
 * Valida e formata um preço para garantir que seja um número válido
 * @param {string|number} price - Preço a ser validado
 * @returns {number} - Preço validado como número
 */
function validatePrice(price) {
  if (typeof price === 'number') {
    return price > 0 ? price : 0;
  }

  if (!price || typeof price !== 'string') {
    return 0;
  }

  try {
    // Remove caracteres não numéricos, exceto ponto e vírgula
    let cleanPrice = price.replace(/[^0-9.,]/g, '');
    
    // Substitui vírgula por ponto para conversão
    cleanPrice = cleanPrice.replace(',', '.');
    
    // Converte para número
    const numPrice = parseFloat(cleanPrice);
    
    // Retorna 0 se não for um número válido
    return isNaN(numPrice) ? 0 : numPrice;
  } catch (error) {
    logger.error(`Erro ao validar preço: ${error.message}`);
    return 0;
  }
}

/**
 * Valida um objeto de produto para garantir que tenha todos os campos necessários
 * @param {Object} product - Objeto do produto
 * @param {string} baseUrl - URL base para completar URLs relativas
 * @returns {Object} - Produto validado
 */
function validateProduct(product, baseUrl = '') {
  if (!product) {
    return null;
  }

  try {
    // Cria uma cópia do produto para não modificar o original
    const validatedProduct = { ...product };
    
    // Valida campos obrigatórios
    validatedProduct.name = product.name || 'Produto sem nome';
    validatedProduct.price = validatePrice(product.price);
    
    // Valida URLs
    if (product.productUrl) {
      validatedProduct.productUrl = validateUrl(product.productUrl, baseUrl);
    } else if (product.url) {
      validatedProduct.productUrl = validateUrl(product.url, baseUrl);
      delete validatedProduct.url; // Remove o campo antigo
    }
    
    validatedProduct.imageUrl = validateUrl(product.imageUrl, baseUrl);
    
    // Garante que a loja esteja definida
    validatedProduct.store = product.store || 'Desconhecida';
    
    // Garante que a categoria esteja definida
    validatedProduct.category = product.category || 'outros';
    
    return validatedProduct;
  } catch (error) {
    logger.error(`Erro ao validar produto: ${error.message}`);
    return product; // Retorna o produto original em caso de erro
  }
}

module.exports = {
  validateUrl,
  validatePrice,
  validateProduct
};