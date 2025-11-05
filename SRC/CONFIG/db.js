const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Pool de conexiones para evitar "_addCommandClosed" por conexiones cerradas/inactivas
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || process.env.DB_NAME || 'biblioteca_ie_bg',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error('Hubo un problema al obtener conexión del pool:', err);
  } else {
    console.log(`Pool MySQL listo en ${conn.config.host}:${conn.config.port} (DB: ${conn.config.database})`);
    conn.release();
  }
});

module.exports = pool;
module.exports.promise = () => pool.promise();
