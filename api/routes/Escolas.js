const express = require('express');
const router = express.Router();

const { sql } = require('../db');

router.get('/buscar', async (req, res) => {

    try {

        const termo = req.query.nome;

        if (!termo || termo.length < 3) {

            return res.json([]);
        }

        const result = await new sql.Request()
            .input('Nome', sql.VarChar, `%${termo}%`)
            .query(`
                SELECT TOP 10
                    NO_Entidade
                FROM Importa_Censo_2025
                WHERE NO_Entidade LIKE @Nome
                ORDER BY NO_Entidade
            `);

        res.json(result.recordset);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: 'Erro ao buscar escolas'
        });
    }

});

module.exports = router;