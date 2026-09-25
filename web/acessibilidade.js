// ========================================
// ACESSIBILIDADE
// ========================================

// ----------------------------------------
// ALTO CONTRASTE
// ----------------------------------------

function alternarAltoContraste() {

    document.body.classList.toggle("alto-contraste");

    const ativo =
        document.body.classList.contains("alto-contraste");

    localStorage.setItem("altoContraste", ativo);

    atualizarBotoesAcessibilidade();
}

// ----------------------------------------
// ATUALIZA BOTÕES
// ----------------------------------------

function atualizarBotoesAcessibilidade() {

    const botaoContraste =
        document.getElementById("btn-alto-contraste");

    if (botaoContraste) {

        const ativo =
            document.body.classList.contains("alto-contraste");

        botaoContraste.setAttribute(
            "aria-pressed",
            ativo ? "true" : "false"
        );
    }
}


// ----------------------------------------
// CARREGA CONFIGURAÇÕES SALVAS
// ----------------------------------------

function carregarConfiguracoesAcessibilidade() {

    const altoContraste =
        localStorage.getItem("altoContraste");


    if (altoContraste === "true") {

        document.body.classList.add(
            "alto-contraste"
        );
    }



    atualizarBotoesAcessibilidade();
}


// ========================================
// PAINEL DE ACESSIBILIDADE
// ========================================

function configurarPainelAcessibilidade() {

    const botao =
        document.getElementById("btn-acessibilidade");

    const painel =
        document.getElementById("painel-acessibilidade");


    if (!botao || !painel) {
        return;
    }


    botao.addEventListener("click", () => {

        const aberto =
            botao.getAttribute("aria-expanded") === "true";


        botao.setAttribute(
            "aria-expanded",
            String(!aberto)
        );


        painel.hidden = aberto;

    });
}


// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarConfiguracoesAcessibilidade();

        configurarPainelAcessibilidade();

    }
);