const express = require('express');
const router = express.Router();

const { sql } = require('../db');
const { v4: uuidv4 } = require('uuid');

const { cpf } = require('cpf-cnpj-validator');

router.post('/cadastro', async (req, res) => {

    const transaction = new sql.Transaction();
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

        const loginExiste = await new sql.Request()
            .input('Username', sql.VarChar, user)
            .query(`
                SELECT UserID
                FROM Users
                WHERE Username = @Username
            `);

        if (loginExiste.recordset.length > 0) {

            return res.status(400).json({
                error: 'Login já cadastrado'
            });
        }

        // =========================
        // VERIFICA EMAIL
        // =========================

        const emailExiste = await new sql.Request()
            .input('Email', sql.VarChar, email)
            .query(`
                SELECT UserID
                FROM Motoristas
                WHERE Email = @Email
            `);

        if (emailExiste.recordset.length > 0) {

            return res.status(400).json({
                error: 'Email já cadastrado'
            });
        }

        // =========================
        // VERIFICA CPF
        // =========================

        const cpfExiste = await new sql.Request()
            .input('CPF', sql.VarChar, cpfRecebido)
            .query(`
                SELECT UserID
                FROM Motoristas
                WHERE CPF = @CPF
            `);

        if (cpfExiste.recordset.length > 0) {

            return res.status(400).json({
                error: 'CPF já cadastrado'
            });
        }

        // =========================
        // VERIFICA CNH
        // =========================

        const cnhExiste = await new sql.Request()
            .input('CNH', sql.VarChar, somenteNumerosCNH)
            .query(`
                SELECT UserID
                FROM Motoristas
                WHERE CNH = @CNH
            `);

        if (cnhExiste.recordset.length > 0) {

            return res.status(400).json({
                error: 'CNH já cadastrada'
            });
        }

        // =========================
        // VERIFICA PLACA
        // =========================

        const placaExiste = await new sql.Request()
            .input('Placa', sql.VarChar, placaLimpa)
            .query(`
                SELECT ID_Veiculo
                FROM Veiculos
                WHERE Placa = @Placa
            `);

        if (placaExiste.recordset.length > 0) {

            return res.status(400).json({
                error: 'Placa já cadastrada'
            });
        }

        // =========================
        // BUSCA ROLE
        // =========================

        const roleResult = await new sql.Request()
            .query(`
                SELECT TOP 1 RoleID
                FROM Roles
                WHERE RoleName = 'Motorista'
            `);

        if (roleResult.recordset.length === 0) {

            return res.status(400).json({
                error: 'Role Motorista não encontrada'
            });
        }

        const roleId = roleResult.recordset[0].RoleID;

        const userId = uuidv4();

        // =========================
        // INICIA TRANSACTION
        // =========================

        await transaction.begin();

        const requestUser = new sql.Request(transaction);
        const requestMotorista = new sql.Request(transaction);
        const requestVeiculo = new sql.Request(transaction);
        const senhaHash = await bcrypt.hash(senha, 10);
        // =========================
        // INSERT USERS
        // =========================

        await requestUser
            .input('UserID', sql.UniqueIdentifier, userId)
            .input('Username', sql.VarChar, user)
            .input('RoleID', sql.UniqueIdentifier, roleId)
            .input('PasswordHash', sql.VarChar, senhaHash)
            .query(`
                INSERT INTO Users
                (
                    UserID,
                    Username,
                    RoleID,
                    PasswordHash
                )
                VALUES
                (
                    @UserID,
                    @Username,
                    @RoleID,
                    @PasswordHash
                )
            `);

        // =========================
        // INSERT MOTORISTA
        // =========================

        const motoristaResult = await requestMotorista
            .input('NomeMotorista', sql.VarChar, nome)
            .input('CPF', sql.VarChar, cpfRecebido)
            .input('Contato1', sql.VarChar, telefone)
            .input('CNH', sql.VarChar, somenteNumerosCNH)
            .input('Categoria_CNH', sql.VarChar, categoria_cnh)
            .input('Validade_CNH', sql.Date, validade_cnh)
            .input('Email', sql.VarChar, email)
            .input('TempoExperiencia', sql.Int, anos_exp)
            .input('UserID', sql.UniqueIdentifier, userId)
            .query(`
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

                OUTPUT INSERTED.ID_Motorista

                VALUES
                (
                    @UserID,
                    @NomeMotorista,
                    @CPF,
                    @Contato1,
                    @CNH,
                    @Categoria_CNH,
                    @Validade_CNH,
                    @Email,
                    @TempoExperiencia
                )
            `);

        // =========================
        // PEGA ID MOTORISTA
        // =========================

        const idMotorista =
            motoristaResult.recordset[0].ID_Motorista;

        // =========================
        // INSERT VEICULO
        // =========================

        await requestVeiculo
            .input('ID_Motorista', sql.Int, idMotorista)
            .input('Placa', sql.VarChar, placaLimpa)
            .input('Capacidade', sql.Int, capacidade)
            .input('Modelo', sql.VarChar, modelo)
            .input('Ano', sql.DateTime, ano)
            .input('Regiao', sql.VarChar, regiao)
            .input('obs', sql.VarChar, obs)
            .query(`
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
                    @ID_Motorista,
                    @Placa,
                    @Capacidade,
                    @Modelo,
                    @Ano,
                    @Regiao,
                    @obs
                )
            `);

        // =========================
        // COMMIT
        // =========================

        await transaction.commit();

        res.status(201).json({
            message: 'Motorista cadastrado com sucesso'
        });

    } catch (err) {

        console.log('ERRO REAL:', err);

        // =========================
        // ROLLBACK
        // =========================

        try {
            await transaction.rollback();
        } catch {}

        res.status(500).json({
            error: 'Erro no cadastro',
            detalhe: err.message
        });
    }
});

module.exports = router;