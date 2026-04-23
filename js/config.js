// Configuração da API
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  ENDPOINTS: {
    SITE_DATA: '/site-data',
    STORES: '/stores',
    CATEGORIES: '/categories',
    COMPONENTS: '/components',
    BUILD: '/build',
    SEARCH: '/search',
    PRICES: '/prices',
    RECOMMENDATIONS: '/recommendations'
  }
};

/**
 * Utilitário para chamadas de API
 */
const apiClient = {
  async get(endpoint, params = {}) {
    const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na requisição: ${response.statusText}`);
    return await response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Erro na requisição: ${response.statusText}`);
    return await response.json();
  },

  async put(endpoint, data) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Erro na requisição: ${response.statusText}`);
    return await response.json();
  },

  async delete(endpoint) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Erro na requisição: ${response.statusText}`);
    return await response.json();
  }
};

// Exporta as configurações e o cliente
window.API_CONFIG = API_CONFIG;
window.apiClient = apiClient;
