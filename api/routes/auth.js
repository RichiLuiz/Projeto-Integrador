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

        // Validação básica
        if (!username || !password) {
            return res.status(400).json({
                error: 'Usuário e senha são obrigatórios'
            });
        }

        // PostgreSQL utiliza $1, $2, etc.
        const result = await pool.query(`
            SELECT
                U."userID",
                U."username",
                U."passwordHash",
                R."roleName"
            FROM "users" U
            INNER JOIN "roles" R
                ON U."roleID" = R."roleID"
            WHERE U."username" = $1
        `, [username]);

        // Usuário não encontrado
        if (result.rows.length === 0) {

            return res.status(400).json({
                error: 'Usuário não encontrado'
            });
        }

        const user = result.rows[0];

        // Valida senha usando bcrypt
        const senhaValida = await bcrypt.compare(
            password,
            user.PasswordHash
        );

        if (!senhaValida) {

            return res.status(400).json({
                error: 'Senha inválida'
            });
        }

        // Login realizado
        res.json({
            message: 'Login realizado',
            role: user.RoleName,
            userId: user.UserID,
            username: user.Username
        });

    } catch (err) {

        console.error('Erro no login:', err);

        res.status(500).json({
            error: 'Erro no login'
        });
    }

});

module.exports = router;
