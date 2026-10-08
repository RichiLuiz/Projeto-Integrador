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
                noentidade
            FROM importa_censo_2025
            WHERE noentidade ILIKE $1
            ORDER BY noentidade
            LIMIT 3
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