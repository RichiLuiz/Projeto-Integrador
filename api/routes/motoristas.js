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
            email,
            telefone,
            cnh,
            categoria_cnh,
            validade_cnh,
            anos_exp,
            user,
            placa,
            capacidade,
            obs,
            modelo,
            ano,
            regiao,
            senha

        } = req.body;

        // =========================
        // VALIDAÇÕES.
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
        if (!cpf.isValid(cpfRecebido)) {

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

        // CNH
        const somenteNumerosCNH = cnh.replace(/\D/g, '');

        if (
            somenteNumerosCNH.length < 9 ||
            somenteNumerosCNH.length > 11
        ) {

            return res.status(400).json({
                error: 'CNH inválida'
            });
        }

        // PLACA
        const placaLimpa = placa
            .replace('-', '')
            .trim()
            .toUpperCase();

        if (placaLimpa.length < 7) {

            return res.status(400).json({
                error: 'Placa inválida'
            });
        }

        // CAPACIDADE
        //================
        if (!capacidade || capacidade <= 0) {

            return res.status(400).json({
                error: 'Capacidade inválida'
            });
        }

        // ANO
        if (!ano || ano < 1990 || ano > 2100) {

            return res.status(400).json({
                error: 'Ano do veículo inválido'
            });
        }

        // =========================
        // VERIFICA LOGIN
        // =========================

        const loginExiste = await client.query(
            `
                SELECT UserID
                FROM Users
                WHERE Username = $1
            `,
            [user]
        );

        if (loginExiste.rows.length > 0) {

            return res.status(400).json({
                error: 'Login já cadastrado'
            });
        }

        // =========================
        // VERIFICA EMAIL
        // =========================

        const emailExiste = await client.query(
            `
                SELECT UserID
                FROM Motoristas
                WHERE Email = $1
            `,
            [email]
        );

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
                SELECT UserID
                FROM Motoristas
                WHERE CPF = $1
            `,
            [cpfRecebido]
        );

        if (cpfExiste.rows.length > 0) {

            return res.status(400).json({
                error: 'CPF já cadastrado'
            });
        }

        // =========================
        // VERIFICA CNH
        // =========================

        const cnhExiste = await client.query(
            `
                SELECT UserID
                FROM Motoristas
                WHERE CNH = $1
            `,
            [somenteNumerosCNH]
        );

        if (cnhExiste.rows.length > 0) {

            return res.status(400).json({
                error: 'CNH já cadastrada'
            });
        }

        // =========================
        // VERIFICA PLACA
        // =========================

        const placaExiste = await client.query(
            `
                SELECT ID_Veiculo
                FROM Veiculos
                WHERE Placa = $1
            `,
            [placaLimpa]
        );

        if (placaExiste.rows.length > 0) {

            return res.status(400).json({
                error: 'Placa já cadastrada'
            });
        }

        // =========================
        // BUSCA ROLE
        // =========================

        const roleResult = await client.query(
            `
                SELECT RoleID
                FROM Roles
                WHERE RoleName = 'Motorista'
                LIMIT 1
            `
        );

        if (roleResult.rows.length === 0) {

            return res.status(400).json({
                error: 'Role Motorista não encontrada'
            });
        }

        const roleId = roleResult.rows[0].roleid;

        const userId = uuidv4();

        // =========================
        // INICIA TRANSACTION
        // =========================

        await client.query('BEGIN');

        const senhaHash = await bcrypt.hash(senha, 10);

        // =========================
        // INSERT USERS
        // =========================

        await client.query(
            `
                INSERT INTO Users
                (
                    UserID,
                    Username,
                    RoleID,
                    PasswordHash
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
        // INSERT MOTORISTA
        // =========================

        const motoristaResult = await client.query(
            `
                INSERT INTO Motoristas
                (
                    UserID,
                    NomeMotorista,
                    CPF,
                    Contato1,
                    CNH,
                    Categoria_CNH,
                    Validade_CNH,
                    Email,
                    TempoExperiencia
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9
                )
                RETURNING ID_Motorista
            `,
            [
                userId,
                nome,
                cpfRecebido,
                telefone,
                somenteNumerosCNH,
                categoria_cnh,
                validade_cnh,
                email,
                anos_exp
            ]
        );

        // =========================
        // PEGA ID MOTORISTA
        // =========================

        const idMotorista =
            motoristaResult.rows[0].id_motorista;

        // =========================
        // INSERT VEICULO
        // =========================

        await client.query(
            `
                INSERT INTO Veiculos
                (
                    ID_Motorista,
                    Placa,
                    Capacidade,
                    Modelo,
                    Ano_Veiculo,
                    Regiao,
                    observacoes
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7
                )
            `,
            [
                idMotorista,
                placaLimpa,
                capacidade,
                modelo,
                ano,
                regiao,
                obs
            ]
        );

        // =========================
        // COMMIT
        // =========================

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Motorista cadastrado com sucesso'
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