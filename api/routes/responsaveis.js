const express = require('express');
const router = express.Router();

const { pool } = require('../db');
const { v4: uuidv4 } = require('uuid');

const { cpf } = require('cpf-cnpj-validator');

router.post('/cadastro', async (req, res) => {

    const client = await pool.connect();
    const bcrypt = require('bcrypt');
    try {

        const {
            nome,
            cpf: cpfRecebido,
            telefone,
            email,
            user,
            senha
        } = req.body;

        // =========================
        // VALIDAÇÕES
        // =========================

        // LOGIN
        if (!user || user.trim().length < 4) {

            return res.status(400).json({
                error: 'Login deve possuir no mínimo 4 caracteres'
            });
        }

        // SENHA
        if (!senha || senha.length < 8) {

            return res.status(400).json({
                error: 'Senha deve possuir no mínimo 8 caracteres'
            });
        }

        // CPF
        if (!cpfRecebido || !cpf.isValid(cpfRecebido)) {

            return res.status(400).json({
                error: 'CPF inválido'
            });
        }

        // EMAIL
        if (!email || !email.includes('@')) {

            return res.status(400).json({
                error: 'Email inválido'
            });
        }

        // =========================
        // VERIFICA LOGIN
        // =========================

        const loginExiste = await client.query(`
                SELECT userid
                FROM users
                WHERE username = $1
            `,[user]
        );

        if (loginExiste.rows.length > 0) {

            return res.status(400).json({
                error: 'Login de usuário já cadastrado, favor escolher outro'
            });
        }

        // =========================
        // VERIFICA EMAIL
        // =========================

        const emailExiste = await client.query(
            `
                SELECT userid
                FROM responsaveis
                WHERE Email = $1
            `, [email] );

        if (emailExiste.rows.length > 0) {

            return res.status(400).json({
                error: 'Email já cadastrado'
            });
        }

        // =========================
        // VERIFICA CPF
        // =========================

        const cpfExiste = await client.query(
            `
                SELECT userid
                FROM responsaveis
                WHERE cpf = $1
            `,
            [cpfRecebido]
        );

        if (cpfExiste.rows.length > 0) {

            return res.status(400).json({
                error: 'CPF já cadastrado'
            });
        }

        // =========================
        // BUSCA ROLE
        // =========================

        const roleResult = await client.query(
            `
                SELECT roleid
                FROM roles
                WHERE rolename = 'Responsavel'
            `);

        if (roleResult.rows.length === 0) {

            return res.status(400).json({
                error: 'Role Responsavel não encontrada'
            });
        }

        const roleId = roleResult.rows[0].roleid;

        const userId = uuidv4();


        // =========================
        // INICIA TRANSACTION
        // =========================
        await client.query('BEGIN');


        // =========================
        // HASH DA SENHA
        // =========================
        const senhaHash = await bcrypt.hash(senha, 10);


        // =========================
        // INSERT USERS
        // =========================

        await client.query(
            `
                INSERT INTO Users
                (
                    userid,
                    username,
                    roleid,
                    passwordhash
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4
                )
            `,
            [
                userId,
                user,
                roleId,
                senhaHash
            ]
        );

        // =========================
        // INSERT RESPONSAVEL
        // =========================

        const responsavelResult =await client.query(
            `
             INSERT INTO Responsaveis
                    (
                        userid,
                        nome,
                        cpf,
                        contato1,
                        email
                    )
                    VALUES
                    (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                    )
                `,
                [
                userId,
                nome,
                cpfRecebido,
                telefone,
                email    
                ]
            
                );


        // =========================
        // COMMIT
        // =========================

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Responsável cadastrado com sucesso'
        });

    } catch (err) {

        console.log('ERRO REAL:', err);

       // =========================
        // ROLLBACK
        // =========================

        try {
            await client.query('ROLLBACK');
        } catch {}

        res.status(500).json({
            error: 'Erro no cadastro',
            detalhe: err.message
        });

    } finally {

        client.release();

    }
});

module.exports = router;
