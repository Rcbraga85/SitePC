const { Pool, types } = require('pg');
const logger = require('./utils/logger');
require('dotenv').config();

// Configurar o driver para converter tipos NUMERIC (OID 1700) para Float
// O Postgres retorna NUMERIC como string por padrão para evitar perda de precisão
types.setTypeParser(1700, function(val) {
  return val === null ? null : parseFloat(val);
});

/**
 * Configuração do Pool de conexão com o PostgreSQL
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'rodrules',
  database: process.env.DB_NAME || 'SitePC_trae',
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

/**
 * Event listener para capturar erros em conexões ociosas
 */
pool.on('error', (err) => {
  logger.error('Erro inesperado no pool do PostgreSQL', err);
  process.exit(-1);
});

/**
 * Utilitário para executar queries
 * @param {string} text - Query SQL
 * @param {Array} params - Parâmetros da query
 * @returns {Promise<Object>} - Resultado da query
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Query executada', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Erro na execução da query', { text, error: error.message });
    throw error;
  }
};

/**
 * Testa a conexão com o banco de dados
 */
const testConnection = async () => {
  try {
    const res = await query('SELECT NOW()');
    logger.info('Conexão com PostgreSQL estabelecida com sucesso', { time: res.rows[0].now });
    return true;
  } catch (error) {
    logger.error('Falha ao conectar no PostgreSQL', { error: error.message });
    return false;
  }
};

module.exports = {
  query,
  pool,
  testConnection
};
