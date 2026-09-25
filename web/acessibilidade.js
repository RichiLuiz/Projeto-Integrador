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
// TEXTO GRANDE
// ----------------------------------------

function aumentarTexto() {

    document.body.classList.remove("texto-pequeno");

    document.body.classList.add("texto-grande");

    localStorage.setItem("tamanhoTexto", "grande");

    atualizarBotoesAcessibilidade();
}


// ----------------------------------------
// TEXTO PEQUENO
// ----------------------------------------

function diminuirTexto() {

    document.body.classList.remove("texto-grande");

    document.body.classList.add("texto-pequeno");

    localStorage.setItem("tamanhoTexto", "pequeno");

    atualizarBotoesAcessibilidade();
}


// ----------------------------------------
// TEXTO NORMAL
// ----------------------------------------

function textoNormal() {

    document.body.classList.remove("texto-grande");

    document.body.classList.remove("texto-pequeno");

    localStorage.setItem("tamanhoTexto", "normal");

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

    const tamanhoTexto =
        localStorage.getItem("tamanhoTexto");


    if (altoContraste === "true") {

        document.body.classList.add(
            "alto-contraste"
        );
    }


    if (tamanhoTexto === "grande") {

        document.body.classList.add(
            "texto-grande"
        );
    }


    if (tamanhoTexto === "pequeno") {

        document.body.classList.add(
            "texto-pequeno"
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