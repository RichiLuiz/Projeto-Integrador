const express = require('express');
const router = express.Router();

const { pool } = require('../db');

/* =========================================================
   CADASTRO DE DEPENDENTE
   Vincula o dependente ao responsável identificado pelo login.
   ========================================================= */

router.post('/cadastro', async (req, res) => {
    let client;

    try {
        client = await pool.connect();

        const {
            nome,
            dtnasc,
            escola,
            turno,
            cep,
            rua,
            bairro,
            numero,
            necessidades,
            username
        } = req.body;

        /* =================================================
           VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS
           ================================================= */

        if (
            !nome ||
            !dtnasc ||
            !escola ||
            !turno ||
            !cep ||
            !rua ||
            !bairro ||
            !numero
        ) {
            return res.status(400).json({
                error: 'Preencha todos os campos obrigatórios.'
            });
        }

        if (!username) {
            return res.status(401).json({
                error: 'Não foi possível identificar o responsável conectado.'
            });
        }

        /* =================================================
           LOCALIZA O RESPONSÁVEL NO BANCO
           userid é UUID nas duas tabelas.
           ================================================= */

        const consultaResponsavel = await client.query(
            `SELECT R.id_responsavel
             FROM responsaveis R
             INNER JOIN users U
                 ON R.userid = U.userid
             WHERE U.username = $1
             LIMIT 1`,
            [username]
        );

        if (consultaResponsavel.rows.length === 0) {
            return res.status(404).json({
                error: 'Responsável não encontrado.'
            });
        }

        const idResponsavel =
            consultaResponsavel.rows[0].id_responsavel;

        /* =================================================
           PREPARA OS DADOS DO DEPENDENTE
           A coluna necessidadeespecial é BOOLEAN.
           ================================================= */

        const necessidadeEspecial =
            necessidades === true ||
            necessidades === 'true' ||
            necessidades === 'on' ||
            necessidades === 'sim';

        const pontoEmbarque =
            `${rua.trim()}, ${numero.trim()}, ` +
            `${bairro.trim()} - CEP: ${cep.trim()}`;

        /* =================================================
           INSERE O DEPENDENTE NO SUPABASE
           ================================================= */

        const resultado = await client.query(
            `INSERT INTO dependente (
                nome,
                data_nascimento,
                escola,
                turno,
                ponto_embarque,
                observacao,
                id_responsavel
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id_dependente, id_responsavel`,
            [
                nome.trim(),
                dtnasc,
                escola.trim(),
                turno,
                pontoEmbarque,
                necessidadeEspecial,
                idResponsavel
            ]
        );

const responsavelqtddependentes = await client.query(
    `UPDATE responsaveis R
     SET qtddependentes = COALESCE(R.qtddependentes, 0) + 1
     FROM users U
     WHERE R.userid = U.userid
       AND U.username = $1
     RETURNING R.id_responsavel, R.qtddependentes`,
    [username]
);


        /* =================================================
           RETORNO DO CADASTRO
           ================================================= */

        return res.status(201).json({
            message: 'Dependente cadastrado com sucesso!',
            dependente: resultado.rows[0]
        });

    } catch (erro) {
        console.error(
            'Erro ao cadastrar dependente:',
            erro
        );

        return res.status(500).json({
            error: 'Erro interno ao cadastrar dependente.',
            detalhe: erro.message
        });

    } finally {
        if (client) {
            client.release();
        }
    }
});

module.exports = router;