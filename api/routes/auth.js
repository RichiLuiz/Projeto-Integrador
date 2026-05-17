const express = require('express');
const router = express.Router();

const { sql } = require('../db');

const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        const result = await new sql.Request()
            .input('Username', sql.VarChar, username)
            .query(`
                SELECT
                    U.UserID,
                    U.Username,
                    U.PasswordHash,
                    R.RoleName
                FROM Users U
                INNER JOIN Roles R
                    ON U.RoleID = R.RoleID
                WHERE U.Username = @Username
            `);

        if (result.recordset.length === 0) {

            return res.status(400).json({
                error: 'Usuário não encontrado'
            });
        }

        const user = result.recordset[0];

        const senhaValida =
            await bcrypt.compare(
                password,
                user.PasswordHash
            );

        if (!senhaValida) {

            return res.status(400).json({
                error: 'Senha inválida'
            });
        }

        res.json({
            message: 'Login realizado',
            role: user.RoleName,
            userId: user.UserID
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: 'Erro no login'
        });
    }

});

module.exports = router;