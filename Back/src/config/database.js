const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: 'localhost', 
    user: 'root',
    password: 'root', 
    database: 'gestorDeCursos',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
}) 

module.exports = pool;

// configuração do BD