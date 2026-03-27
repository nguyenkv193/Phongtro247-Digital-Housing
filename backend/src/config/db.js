const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rental_room_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

pool.getConnection()
    .then(connection => {
        console.log('Kết nối MySQL thành công!');
        connection.release();
    })
    .catch(err => {
        console.error('Kết nối MySQL thất bại:', err.message);
    });

module.exports = pool;
