
const express = require('express');
const router = express.Router();

const { pool } = require('../db');

router.get('/dashboard/:username', async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({
                error: 'Nome de usuário não informado.'
            });
        }

        // =====================================
        // 1. BUSCAR RESPONSÁVEL PELO USUÁRIO
        // =====================================

        const responsavelResult = await pool.query(`
            SELECT
                R.id_responsavel,
                R.nome,
                R.cpf,
                R.contato1,
                R.contato2,
                R.email,
                R.endereco,
                R.numero,
                R.cep,
                U.username
            FROM responsaveis R
            INNER JOIN users U
                ON R.userid = U.userid
            WHERE U.username = $1
            LIMIT 1
        `, [username]);

        if (responsavelResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Responsável não encontrado.'
            });
        }

        const responsavel = responsavelResult.rows[0];

        // =====================================
        // 2. BUSCAR SOMENTE OS DEPENDENTES
        //    DESTE RESPONSÁVEL
        // =====================================

        const dependenteResult = await pool.query(`
            SELECT
                D.id_dependente,
                D.nome,
                D.data_nascimento,
                D.escola,
                D.turno,
                D.ponto_embarque,
                D.ponto_desembarque,
                D.ativo
            FROM dependente D
            WHERE D.id_responsavel = $1
            ORDER BY D.id_dependente
        `, [responsavel.id_responsavel]);

        const dependentes = dependenteResult.rows;
        const qtdDependentes = dependentes.length;

        // =====================================
        // 3. BUSCAR MOTORISTAS ATIVOS
        // =====================================

        const motoristasResult = await pool.query(`
            SELECT
                M.nomemotorista
            FROM motoristas M
            WHERE M.ativo = TRUE
            ORDER BY M.nomemotorista
        `);

        // =====================================
        // 4. RETORNAR DADOS PARA O FRONTEND
        // =====================================

        return res.status(200).json({
            responsavel: {
                ...responsavel,
                qtddependentes: qtdDependentes
            },
            qtddependentes: qtdDependentes,
            dependentes,
            motoristas: motoristasResult.rows
        });

    } catch (erro) {
        console.error(
            'ERRO DASHBOARD RESPONSAVEL:',
            erro
        );

        return res.status(500).json({
            error: 'Erro ao carregar dashboard.',
            detalhe: erro.message
        });
    }
});

module.exports = router;
