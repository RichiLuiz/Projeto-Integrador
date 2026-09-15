const express = require('express');
const router = express.Router();

const { sql } = require('../db');

router.get('/dashboard/:username', async (req, res) => {

    try {

        const { username } = req.params;

        const motoristaResult =
            await new sql.Request()
                .input('username', sql.VarChar, username)
                .query(`
                    SELECT
                        M.*
                    FROM users U
                    INNER JOIN motoristas M
                        ON U.userID = M.userID
                    WHERE U.username = @Username
                `);

        if (motoristaResult.recordset.length === 0) {

            return res.status(404).json({
                error: 'Motorista não encontrado'
            });
        }

        const motorista =
            motoristaResult.recordset[0];

        const veiculoResult =
            await new sql.Request()
                .input(
                    'id_motorista',
                    sql.Int,
                    motorista.id_motorista
                )
                .query(`
                    SELECT TOP 1 *
                    FROM veiculos
                    WHERE id_motorista = @ID_Motorista
                `);

        const veiculo =
            veiculoResult.recordset[0] || null;

        res.json({
            motorista,
            veiculo
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: 'Erro ao carregar dashboard'
        });
    }

});

module.exports = router;