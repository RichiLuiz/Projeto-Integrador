const express = require('express');
const router = express.Router();

const { pool } = require('../db');

router.get('/dashboard/:username', async (req, res) => {

    try {

        const { username } = req.params;

        // =========================
        // BUSCA RESPONSÁVEL
        // =========================

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
        `, [username]);

        if (responsavelResult.rows.length === 0) {

            return res.status(404).json({
                error: 'Responsável não encontrado'
            });
        }

        const responsavel = responsavelResult.rows[0];

        // =========================
        // BUSCA ALUNO
        // =========================
         //   
       const alunoResult = await pool.query(`
    SELECT
        A.id_aluno,
        A.nome,
        A.data_nascimento,
        A.escola,
        A.turno,
        A.necessidadeespecial,
        CONCAT(
            SPLIT_PART(A.ponto_embarque, ',', 1),
            ' ',
            R.numero
        ) AS ponto_embarque,
        CAST(C.co_cep AS VARCHAR(20)) AS co_cep
    FROM aluno A
    right JOIN responsaveis R
        ON A.id_responsavel = R.id_responsavel
    left JOIN importa_censo_2025 C
        ON A.id_escola = C.co_entidade
    WHERE A.id_responsavel = $1
    LIMIT 1
`, [responsavel.id_responsavel]);

    const aluno =
            alunoResult.rows.length > 0
             ? alunoResult.rows[0]
                : null;

        // =========================
        // Busca Motorista
        // =========================

        const motoristasResult =await pool.query(`
                    SELECT
                    M.nomemotorista,
                    M.tempoexperiencia,
                    M.regiaoatuacao,
                    M.contato1
                    from motoristas M
                    WHERE M.ativo= true
        `);



        // =========================
        // RETORNO
        // =========================

        res.json({
            responsavel,
            aluno,
            motoristas: motoristasResult.rows
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
