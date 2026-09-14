require('dotenv').config({ path: __dirname + '/.env' });

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    family: 4
    
});

async function connectDB() {
    try {
        const client = await pool.connect();

        console.log('Conectado ao PostgreSQL/Supabase');

        client.release();
    } catch (err) {
        console.error('Erro ao conectar ao PostgreSQL/Supabase:');
        console.error(err);
    }
}

module.exports = {
    pool,
    connectDB
};