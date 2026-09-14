const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function connectDB() {
    try {
        const client = await pool.connect();
        console.log('Conectado ao PostgreSQL/Supabase');
        client.release();
    } catch (err) {
        console.error('Erro ao conectar ao PostgreSQL/Supabase:', err);
    }
}

module.exports = {
    pool,
    connectDB
};
