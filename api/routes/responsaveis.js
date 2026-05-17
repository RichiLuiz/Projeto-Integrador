const express = require('express');
const router = express.Router();

const { sql } = require('../db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const { cpf: cpfValidator } = require('cpf-cnpj-validator');

router.post('/cadastro', async (req, res) => {

    const transaction = new sql.Transaction();

    try {

        const {
            nome,
            cpf,
            telefone,
            email,
            endereco,
            tel2,
            relacao,
            user,
            senha,

            aluno,
            nasc,
            escola,
            turno,
            obs,
            necessidades
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
        if (!cpfValidator.isValid(cpf)) {

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
                SELECT ID_Responsavel
                FROM Responsaveis
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
            .input('CPF', sql.VarChar, cpf)
            .query(`
                SELECT ID_Responsavel
                FROM Responsaveis
                WHERE CPF = @CPF
            `);

        if (cpfExiste.recordset.length > 0) {

            return res.status(400).json({
                error: 'CPF já cadastrado'
            });
        }

        // =========================
        // BUSCA ROLE
        // =========================

        const roleResult = await new sql.Request()
            .query(`
                SELECT TOP 1 RoleID
                FROM Roles
                WHERE RoleName = 'Responsavel'
            `);

        if (roleResult.recordset.length === 0) {

            return res.status(400).json({
                error: 'Role Responsavel não encontrada'
            });
        }

        const roleId = roleResult.recordset[0].RoleID;

        // =========================
        // BUSCA RELAÇÃO
        // =========================

        const relacaoResult = await new sql.Request()
            .input('Relacao', sql.VarChar, relacao)
            .query(`
                SELECT TOP 1 ID_Relacao
                FROM Relacao_Responsaveis
                WHERE Relacao = @Relacao
            `);

        if (relacaoResult.recordset.length === 0) {

            return res.status(400).json({
                error: 'Relação não encontrada'
            });
        }

        const idRelacao =
            relacaoResult.recordset[0].ID_Relacao;

        // =========================
        // NECESSIDADE ESPECIAL
        // =========================

        const necessidadeEspecial =
            necessidades === 'sim' ||
            necessidades === true
                ? 1
                : 0;

        // =========================
        // HASH SENHA
        // =========================

        const senhaHash = await bcrypt.hash(senha, 10);

        const userId = uuidv4();

        // =========================
        // INICIA TRANSACTION
        // =========================

        await transaction.begin();

        const requestUser =
            new sql.Request(transaction);

        const requestResponsavel =
            new sql.Request(transaction);

        const requestAluno =
            new sql.Request(transaction);

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
        // INSERT RESPONSAVEL
        // =========================

        const responsavelResult =
            await requestResponsavel
                .input('UserID', sql.UniqueIdentifier, userId)
                .input('Nome', sql.VarChar, nome)
                .input('CPF', sql.VarChar, cpf)
                .input('Contato1', sql.VarChar, telefone)
                .input('Contato2', sql.VarChar, tel2)
                .input('Email', sql.VarChar, email)
                .input('Endereco', sql.VarChar, obs)
                .query(`
                    INSERT INTO Responsaveis
                    (
                        UserID,
                        Nome,
                        CPF,
                        Contato1,
                        Contato2,
                        Email,
                        Endereco
                    )

                    OUTPUT INSERTED.ID_Responsavel

                    VALUES
                    (
                        @UserID,
                        @Nome,
                        @CPF,
                        @Contato1,
                        @Contato2,
                        @Email,
                        @Endereco
                    )
                `);

        const idResponsavel =
            responsavelResult.recordset[0].ID_Responsavel;

        // =========================
        // INSERT ALUNO
        // =========================

        await requestAluno
            .input('ID_Responsavel', sql.Int, idResponsavel)
            .input('aluno', sql.VarChar, aluno)
            .input('Nascimento', sql.Date, nasc)
            .input('Escola', sql.VarChar, escola)
            .input('Turno', sql.VarChar, turno)
            .input('ID_Relacao', sql.Int, idRelacao)
            .input('NecessidadeEspecial', sql.Bit, necessidadeEspecial)
            .input('PontoEmbarque', sql.VarChar, endereco)
            .input('obs', sql.VarChar, obs)
            .query(`
                INSERT INTO Aluno
                (
                    ID_Responsavel,
                    Nome,
                    Data_Nascimento,
                    Escola,
                    Turno,
                    ID_Relacao,
                    NecessidadeEspecial,
                    Ponto_Embarque,
                    observacao,
                    ponto_desembarque
                )
                VALUES
                (
                    @ID_Responsavel,
                    @aluno,
                    @Nascimento,
                    @Escola,
                    @Turno,
                    @ID_Relacao,
                    @NecessidadeEspecial,
                    @PontoEmbarque,
                    @obs,
                    @Escola
                )
            `);

        // =========================
        // COMMIT
        // =========================

        await transaction.commit();

        res.status(201).json({
            message: 'Responsável cadastrado com sucesso'
        });

    } catch (err) {

        console.log('ERRO REAL:', err);

        try {
            await transaction.rollback();
        } catch {}

        res.status(500).json({
            error: 'Erro ao cadastrar responsável',
            detalhe: err.message
        });
    }
});

module.exports = router;
