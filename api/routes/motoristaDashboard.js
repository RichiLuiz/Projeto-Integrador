const express = require('express');
const router = express.Router();

const { pool } = require('../db');

router.get('/dashboard/:username', async (req, res) => {

    try {

        const { username } = req.params;

        // =========================
        // BUSCAR MOTORISTA
        // =========================

        const motoristaResult = await pool.query(`
            SELECT
                M.*
            FROM users U
            INNER JOIN motoristas M
                ON U.userid = M.userid
            WHERE U.username = $1
        `, [username]);

        if (motoristaResult.rows.length === 0) {

            return res.status(404).json({
                error: 'Motorista não encontrado'
            });
        }

        const motorista =
            motoristaResult.rows[0];


        // =========================
        // BUSCAR VEÍCULO
        // =========================

        const veiculoResult = await pool.query(`
            SELECT *
            FROM veiculos
            WHERE id_motorista = $1
            LIMIT 1
        `, [motorista.id_motorista]);

        const veiculo =
            veiculoResult.rows[0] || null;


        // =========================
        // RETORNO
        // =========================

        res.json({
            motorista,
            veiculo
        });

    } catch (err) {

        console.error(
            'Erro ao carregar dashboard do motorista:',
            err
        );

        res.status(500).json({
            error: 'Erro ao carregar dashboard'
        });
    }

});

module.exports = router;