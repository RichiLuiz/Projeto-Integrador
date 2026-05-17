const express = require('express');
const router = express.Router();

const { sql } = require('../db');

router.get('/dashboard/:username', async (req, res) => {

    try {

        const { username } = req.params;

        const motoristaResult =
            await new sql.Request()
                .input('Username', sql.VarChar, username)
                .query(`
                    SELECT
                        M.*
                    FROM Users U
                    INNER JOIN Motoristas M
                        ON U.UserID = M.UserID
                    WHERE U.Username = @Username
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
                    'ID_Motorista',
                    sql.Int,
                    motorista.ID_Motorista
                )
                .query(`
                    SELECT TOP 1 *
                    FROM Veiculos
                    WHERE ID_Motorista = @ID_Motorista
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