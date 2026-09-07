const { Pool } = require('pg');
const { databaseUrl } = require('./env');

const isRenderDatabase = databaseUrl && new URL(databaseUrl).hostname.endsWith('render.com');
const pool = new Pool({
  connectionString: databaseUrl || undefined,
  ...(isRenderDatabase ? { ssl: { rejectUnauthorized: false } } : {}),
});

module.exports = { pool, query: (text, parameters) => pool.query(text, parameters) };
