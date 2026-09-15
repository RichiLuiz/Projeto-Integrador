const express = require('express');
const router = express.Router();

const { pool } = require('../db');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;

        // Validação
        if (!username || !password) {
            return res.status(400).json({
                error: 'Usuário e senha são obrigatórios'
            });
        }

        const result = await pool.query(`
            SELECT
                U.userid,
                U.username,
                U.passwordhash,
                R.rolename
            FROM users U
            INNER JOIN roles R
                ON U.roleid = R.roleid
            WHERE U.username = $1
        `, [username]);

        // Usuário não encontrado
        if (result.rows.length === 0) {

            return res.status(400).json({
                error: 'Usuário não encontrado'
            });
        }

        const user = result.rows[0];

        // Validação da senha
        const senhaValida = await bcrypt.compare(
            password,
            user.passwordhash
        );

        if (!senhaValida) {

            return res.status(400).json({
                error: 'Senha inválida'
            });
        }

        // Login realizado
        res.json({
            message: 'Login realizado',
            role: user.rolename,
            userId: user.userid,
            username: user.username
        });

    } catch (err) {

        console.error('Erro no login:', err);

        res.status(500).json({
            error: 'Erro no login'
        });
    }

});

module.exports = router;
