const express = require('express');
const router = express.Router();

const { pool } = require('../db');

router.get('/buscar', async (req, res) => {

    try {

        const termo = req.query.nome;

        if (!termo || termo.length < 3) {
            return res.json([]);
        }

        const result = await pool.query(`
            SELECT
                "NO_Entidade"
            FROM "Importa_Censo_2025"
            WHERE "NO_Entidade" ILIKE $1
            ORDER BY "NO_Entidade"
            LIMIT 10
        `, [`%${termo}%`]);

        res.json(result.rows);

    } catch (err) {

        console.error('Erro ao buscar escolas:', err);

        res.status(500).json({
            error: 'Erro ao buscar escolas'
        });
    }

});

module.exports = router;