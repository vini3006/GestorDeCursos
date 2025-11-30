import mysql from 'mysql2/promise' // configuração de acesso ao banco de dados

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'gestorDeCursos',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool;