const mysql = require('mysql2');
require('dotenv').config();

const db_host = process.env.DEV ? process.env.DB_HOST_DEV : process.env.DB_HOST_PROD;
const db_user = process.env.DEV ? process.env.DB_USER_DEV : process.env.DB_USER_PROD;
const db_password = process.env.DEV ? process.env.DB_PASSWORD_DEV : process.env.DB_PASSWORD_PROD;
const db_name = process.env.DEV ? process.env.DB_NAME_DEV : process.env.DB_NAME_PROD;

const pool = mysql.createPool({
  host: db_host,
  user: db_user,
  //password: db_password,  //Activer sur macos en dev
  database: db_name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertir en promesses pour utiliser async/await
const promisePool = pool.promise();

module.exports = promisePool;