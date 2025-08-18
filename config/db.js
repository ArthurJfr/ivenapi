const mysql = require('mysql2');
require('dotenv').config();
const db_host = process.env.DB_HOST;
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;
const db_name = process.env.DB_NAME;

const pool = mysql.createPool({
  host: db_host,
  user: db_user,
  password: db_password,  //Activer sur macos en dev
  database: db_name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertir en promesses pour utiliser async/await
const promisePool = pool.promise();

module.exports = promisePool;