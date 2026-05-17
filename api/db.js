const sql = require('mssql');

const config = {
    user: 'API_VanConecta',
    password: 'Van@123456',
    server: 'localhost',

    port: 1433,

    database: 'VanConecta',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function connectDB() {
    try {
        await sql.connect(config);
        console.log('Conectado ao SQL Server');
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    sql,
    connectDB
};