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
                    R.qtddependentes,
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
    qtddependentes: responsavel.qtddependentes,
    dependentes: [],
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
