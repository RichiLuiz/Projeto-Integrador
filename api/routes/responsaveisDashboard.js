const express = require('express');
const router = express.Router();

const { sql } = require('../db');

router.get('/dashboard/:username', async (req, res) => {

    try {

        const { username } = req.params;

        // =========================
        // BUSCA RESPONSÁVEL
        // =========================

        const responsavelResult = await new sql.Request()
            .input('Username', sql.VarChar, username)
            .query(`
                SELECT
                    R.ID_Responsavel,
                    R.Nome,
                    R.CPF,
                    R.Contato1,
                    R.Contato2,
                    R.Email,
                    R.Endereco,
                    U.Username
                FROM Responsaveis R
                INNER JOIN Users U
                    ON R.UserID = U.UserID
                WHERE U.Username = @Username
            `);

        if (responsavelResult.recordset.length === 0) {

            return res.status(404).json({
                error: 'Responsável não encontrado'
            });
        }

        const responsavel =
            responsavelResult.recordset[0];

        // =========================
        // BUSCA ALUNO
        // =========================

        const alunoResult = await new sql.Request()
            .input(
                'ID_Responsavel',
                sql.Int,
                responsavel.ID_Responsavel
            )
            .query(`
                SELECT TOP 1
                    A.ID_Aluno,
                    A.Nome,
                    A.Data_Nascimento,
                    A.Escola,
                    A.Turno,
                    A.NecessidadeEspecial,
                    A.Ponto_Embarque,
                    RR.Relacao
                FROM Aluno A

                LEFT JOIN Relacao_Responsaveis RR
                    ON A.ID_Relacao = RR.ID_Relacao

                WHERE A.ID_Responsavel = @ID_Responsavel
            `);

        const aluno =
            alunoResult.recordset.length > 0
                ? alunoResult.recordset[0]
                : null;

        // =========================
        // RETORNO
        // =========================

        res.json({
            responsavel,
            aluno
        });

    } catch (err) {

        console.log('ERRO DASHBOARD RESPONSAVEL:', err);

        res.status(500).json({
            error: 'Erro ao carregar dashboard',
            detalhe: err.message
        });
    }

});

module.exports = router;