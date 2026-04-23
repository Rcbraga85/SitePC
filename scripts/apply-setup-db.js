require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'rodrules',
  database: process.env.DB_NAME || 'SitePC_trae',
});

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'setup_db.sql'), 'utf8');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('setup_db.sql aplicado com sucesso.');
  } finally {
    client.release();
    await pool.end();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
