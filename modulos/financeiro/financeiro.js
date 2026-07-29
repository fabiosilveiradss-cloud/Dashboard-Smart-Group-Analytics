"use strict";

/*
 * Estado central do módulo Financeiro.
 * Os demais arquivos usam estas variáveis globais.
 */
let bancosFinanceiros = [];
let lancamentosFinanceiros = [];
let lancamentosFiltrados = [];
const graficosFinanceiros = {};

document.addEventListener("DOMContentLoaded", iniciarModuloFinanceiro);

function iniciarModuloFinanceiro() {
    configurarAbas();
    configurarPainelFiltros();
    configurarPainelBanco();
    configurarExportacao();
    configurarImportacaoPlanilha();
    atualizarDataHora();
    carregarIndicadoresDemonstrativos();
    renderizarBancos();
    preencherFiltroBancos();
}

function configurarAbas() {
    const botoesAbas =
        document.querySelectorAll(".aba-financeiro");

    const paginas =
        document.querySelectorAll(".pagina-financeiro");

    botoesAbas.forEach((botao) => {
        botao.addEventListener("click", () => {
            const paginaSelecionada =
                botao.dataset.pagina;

            botoesAbas.forEach((item) => {
                item.classList.remove("ativa");
            });

            paginas.forEach((pagina) => {
                pagina.classList.remove("ativa");
            });

            botao.classList.add("ativa");

            const pagina =
                document.getElementById(paginaSelecionada);

            if (pagina) {
                pagina.classList.add("ativa");
            }
        });
    });
}

function configurarExportacao() {
    const botao =
        document.getElementById("btnExportar");

    if (!botao) {
        return;
    }

    botao.addEventListener("click", () => {
        window.print();
    });
}

function atualizarDataHora() {
    const elemento =
        document.getElementById("dataAtualizacao");

    if (!elemento) {
        return;
    }

    const agora = new Date();

    elemento.textContent =
        agora.toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        });
}
