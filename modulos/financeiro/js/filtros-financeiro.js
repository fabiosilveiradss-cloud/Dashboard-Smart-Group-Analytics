"use strict";

/* Filtros da Visão Geral. */

function configurarPainelFiltros() {
    const btnAbrir = document.getElementById("btnAbrirFiltros");
    const btnFechar = document.getElementById("btnFecharFiltros");
    const btnLimpar = document.getElementById("btnLimparFiltros");
    const painel = document.getElementById("painelFiltros");
    const overlay = document.getElementById("filtrosOverlay");
    const formulario = document.getElementById("formFiltros");

    if (!btnAbrir || !btnFechar || !painel || !overlay) return;

    const abrir = () => {
        painel.classList.add("aberto");
        overlay.classList.add("ativo");
        painel.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };

    const fechar = () => {
        painel.classList.remove("aberto");
        overlay.classList.remove("ativo");
        painel.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };

    btnAbrir.addEventListener("click", abrir);
    btnFechar.addEventListener("click", fechar);
    overlay.addEventListener("click", fechar);

    if (btnLimpar && formulario) {
        btnLimpar.addEventListener("click", () => {
            formulario.reset();
            aplicarFiltrosDashboard();
        });
    }

    if (formulario) {
        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();
            aplicarFiltrosDashboard();
            fechar();
        });
    }
}

function preencherFiltrosComDados() {
    preencherSelectUnico(
        "cliente",
        lancamentosFinanceiros.map((item) => item.razaoSocial)
    );
    preencherSelectUnico(
        "representante",
        lancamentosFinanceiros.map((item) => item.representante)
    );
    preencherSelectUnico(
        "planoFinanceiro",
        lancamentosFinanceiros.map((item) => item.planoFinanceiro)
    );
    preencherSelectUnico(
        "tipoDocumento",
        lancamentosFinanceiros.map((item) => item.tipoDocumento)
    );

    const datas = lancamentosFinanceiros
        .flatMap((item) => [item.dataPagamento, item.vencimento, item.dataMovimento])
        .filter(Boolean)
        .sort((a, b) => a - b);

    if (datas.length) {
        const inicio = document.getElementById("periodoInicio");
        const fim = document.getElementById("periodoFim");
        if (inicio) inicio.value = formatarDataInput(datas[0]);
        if (fim) fim.value = formatarDataInput(datas[datas.length - 1]);
    }
}

function preencherSelectUnico(id, valores) {
    const select = document.getElementById(id);
    if (!select) return;

    const primeiroTexto = select.options[0]?.textContent || "Todos";
    select.innerHTML = `<option value="">${escaparHtml(primeiroTexto)}</option>`;

    [...new Set(valores.filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "pt-BR"))
        .forEach((texto) => {
            const option = document.createElement("option");
            option.value = texto;
            option.textContent = texto;
            select.appendChild(option);
        });
}

function aplicarFiltrosDashboard() {
    const inicio = lerDataInput("periodoInicio");
    const fim = lerDataInput("periodoFim");
    const pessoa = document.getElementById("cliente")?.value || "";
    const representante = document.getElementById("representante")?.value || "";
    const banco = document.getElementById("banco")?.value || "";
    const plano = document.getElementById("planoFinanceiro")?.value || "";
    const situacao = document.getElementById("situacao")?.value || "";
    const tipoDocumento = document.getElementById("tipoDocumento")?.value || "";

    lancamentosFiltrados = lancamentosFinanceiros.filter((item) => {
        const dataReferencia =
            item.dataPagamento || item.vencimento || item.dataMovimento;

        if (inicio && (!dataReferencia || dataReferencia < inicio)) return false;
        if (fim && (!dataReferencia || dataReferencia > fim)) return false;
        if (pessoa && item.razaoSocial !== pessoa) return false;
        if (representante && item.representante !== representante) return false;
        if (plano && item.planoFinanceiro !== plano) return false;
        if (situacao && item.situacao !== situacao) return false;
        if (tipoDocumento && item.tipoDocumento !== tipoDocumento) return false;

        if (banco) {
            const identidade = identificarBanco(item.banco, "");
            if (identidade.id !== banco) return false;
        }

        return true;
    });

    atualizarDashboardCompleto(lancamentosFiltrados);
    atualizarTextoPeriodo(inicio, fim);
}

function atualizarTextoPeriodo(inicio, fim) {
    const elemento = document.getElementById("periodoDashboard");
    if (!elemento) return;

    if (!lancamentosFinanceiros.length) {
        elemento.textContent = "Carregue uma planilha para visualizar os dados";
        return;
    }

    if (inicio && fim) {
        elemento.textContent =
            `Período: ${formatarDataBR(inicio)} a ${formatarDataBR(fim)}`;
    } else {
        elemento.textContent = "Todos os períodos disponíveis";
    }
}

function preencherFiltroBancos(limparAntes = false) {
    const select =
        document.getElementById("banco");

    if (!select) {
        return;
    }

    if (limparAntes) {
        select.innerHTML =
            '<option value="">Todos</option>';
    }

    bancosFinanceiros.forEach((banco) => {
        const option =
            document.createElement("option");

        option.value = banco.id;
        option.textContent = banco.nome;

        select.appendChild(option);
    });
}

