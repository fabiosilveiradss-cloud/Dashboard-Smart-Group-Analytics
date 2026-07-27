"use strict";

document.addEventListener("DOMContentLoaded", iniciarModuloFinanceiro);

function iniciarModuloFinanceiro() {
    configurarAbas();
    configurarPainelFiltros();
    atualizarDataHora();
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

function configurarPainelFiltros() {
    const btnAbrir =
        document.getElementById("btnAbrirFiltros");

    const btnFechar =
        document.getElementById("btnFecharFiltros");

    const btnLimpar =
        document.getElementById("btnLimparFiltros");

    const painel =
        document.getElementById("painelFiltros");

    const overlay =
        document.getElementById("filtrosOverlay");

    const formulario =
        document.getElementById("formFiltros");

    if (!btnAbrir || !btnFechar || !painel || !overlay) {
        return;
    }

    function abrirFiltros() {
        painel.classList.add("aberto");
        overlay.classList.add("ativo");

        painel.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";
    }

    function fecharFiltros() {
        painel.classList.remove("aberto");
        overlay.classList.remove("ativo");

        painel.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";
    }

    btnAbrir.addEventListener(
        "click",
        abrirFiltros
    );

    btnFechar.addEventListener(
        "click",
        fecharFiltros
    );

    overlay.addEventListener(
        "click",
        fecharFiltros
    );

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            fecharFiltros();
        }
    });

    if (btnLimpar && formulario) {
        btnLimpar.addEventListener("click", () => {
            formulario.reset();
        });
    }

    if (formulario) {
        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();

            const dadosFormulario =
                new FormData(formulario);

            const filtros =
                Object.fromEntries(
                    dadosFormulario.entries()
                );

            console.log(
                "Filtros financeiros:",
                filtros
            );

            fecharFiltros();
        });
    }
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
