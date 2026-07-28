"use strict";

const bancosFinanceiros = [
    {
        id: "banco-do-brasil",
        nome: "Banco do Brasil",
        tipoConta: "Conta Corrente",
        agencia: "0001",
        conta: "12345-6",
        saldo: 820000,
        totalRecebido: 245000,
        totalPago: 180000,
        emAberto: 46000,
        emAtraso: 12500,
        logo: "assets/bancos/banco-do-brasil.svg",
        sigla: "BB",
        cor: "#f6d000"
    },
    {
        id: "sicredi",
        nome: "Sicredi",
        tipoConta: "Conta Corrente",
        agencia: "0710",
        conta: "98765-4",
        saldo: 240000,
        totalRecebido: 132000,
        totalPago: 89000,
        emAberto: 26000,
        emAtraso: 8500,
        logo: "assets/bancos/sicredi.svg",
        sigla: "SI",
        cor: "#59a52c"
    },
    {
        id: "caixa",
        nome: "Caixa Econômica Federal",
        tipoConta: "Conta Corrente",
        agencia: "1234",
        conta: "45678-9",
        saldo: 680000,
        totalRecebido: 198000,
        totalPago: 153000,
        emAberto: 37000,
        emAtraso: 6300,
        logo: "assets/bancos/caixa.svg",
        sigla: "CX",
        cor: "#0074b8"
    },
    {
        id: "itau",
        nome: "Itaú",
        tipoConta: "Conta Corrente",
        agencia: "4455",
        conta: "11223-4",
        saldo: 315000,
        totalRecebido: 96000,
        totalPago: 77000,
        emAberto: 19000,
        emAtraso: 4200,
        logo: "assets/bancos/itau.svg",
        sigla: "IT",
        cor: "#ec7000"
    }
];

document.addEventListener("DOMContentLoaded", iniciarModuloFinanceiro);

function iniciarModuloFinanceiro() {
    configurarAbas();
    configurarPainelFiltros();
    configurarPainelBanco();
    configurarExportacao();
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

function configurarPainelBanco() {
    const painel =
        document.getElementById("painelBanco");

    const overlay =
        document.getElementById("bancoOverlay");

    const btnFechar =
        document.getElementById("btnFecharBanco");

    if (!painel || !overlay || !btnFechar) {
        return;
    }

    function fecharPainelBanco() {
        painel.classList.remove("aberto");
        overlay.classList.remove("ativo");

        painel.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";
    }

    btnFechar.addEventListener(
        "click",
        fecharPainelBanco
    );

    overlay.addEventListener(
        "click",
        fecharPainelBanco
    );

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            fecharPainelBanco();
        }
    });
}

function abrirDetalhesBanco(banco) {
    const painel =
        document.getElementById("painelBanco");

    const overlay =
        document.getElementById("bancoOverlay");

    if (!painel || !overlay) {
        return;
    }

    preencherTexto(
        "detalheBancoNome",
        banco.nome
    );

    preencherTexto(
        "detalheBancoConta",
        `${banco.tipoConta} • Ag. ${banco.agencia} • Cc. ${banco.conta}`
    );

    preencherTexto(
        "detalheBancoSaldo",
        formatarMoeda(banco.saldo)
    );

    preencherTexto(
        "detalheBancoRecebido",
        formatarMoeda(banco.totalRecebido)
    );

    preencherTexto(
        "detalheBancoPago",
        formatarMoeda(banco.totalPago)
    );

    preencherTexto(
        "detalheBancoAberto",
        formatarMoeda(banco.emAberto)
    );

    preencherTexto(
        "detalheBancoAtraso",
        formatarMoeda(banco.emAtraso)
    );

    const logo =
        document.getElementById("detalheBancoLogo");

    if (logo) {
        logo.innerHTML = criarLogoBanco(banco, "grande");
    }

    painel.classList.add("aberto");
    overlay.classList.add("ativo");

    painel.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";
}

function renderizarBancos() {
    const grade =
        document.getElementById("gradeBancos");

    const saldoTotal =
        document.getElementById("saldoBancarioTotal");

    const quantidade =
        document.getElementById("quantidadeContas");

    if (!grade) {
        return;
    }

    grade.innerHTML = "";

    bancosFinanceiros.forEach((banco) => {
        const card =
            document.createElement("button");

        card.type = "button";
        card.className = "card-banco";

        card.innerHTML = `
            <div class="card-banco-topo">
                <div class="banco-identidade">
                    <div class="banco-logo">
                        ${criarLogoBanco(banco)}
                    </div>

                    <div>
                        <h3>${escaparHtml(banco.nome)}</h3>
                        <p>${escaparHtml(banco.tipoConta)}</p>
                    </div>
                </div>

                <i class="fa-solid fa-chevron-right card-banco-seta"></i>
            </div>

            <div class="banco-dados-conta">
                <span>Ag. ${escaparHtml(banco.agencia)}</span>
                <span>Cc. ${escaparHtml(banco.conta)}</span>
            </div>

            <div class="banco-saldo">
                <span>Saldo disponível</span>
                <strong>${formatarMoeda(banco.saldo)}</strong>
            </div>

            <div class="banco-rodape">
                <span>
                    <i class="fa-solid fa-arrow-trend-up"></i>
                    Recebido: ${formatarMoeda(banco.totalRecebido)}
                </span>
            </div>
        `;

        card.addEventListener("click", () => {
            abrirDetalhesBanco(banco);
        });

        grade.appendChild(card);
    });

    const soma =
        bancosFinanceiros.reduce(
            (total, banco) => total + Number(banco.saldo || 0),
            0
        );

    if (saldoTotal) {
        saldoTotal.textContent =
            formatarMoeda(soma);
    }

    if (quantidade) {
        quantidade.textContent =
            `${bancosFinanceiros.length} contas cadastradas`;
    }
}

function criarLogoBanco(banco, tamanho = "normal") {
    const classe =
        tamanho === "grande"
            ? "logo-banco-imagem logo-banco-imagem-grande"
            : "logo-banco-imagem";

    const sigla =
        escaparHtml(banco.sigla || "BK");

    const cor =
        escaparHtml(banco.cor || "#1683ff");

    const caminho =
        escaparHtml(banco.logo || "");

    return `
        <img
            src="${caminho}"
            alt="Logotipo ${escaparHtml(banco.nome)}"
            class="${classe}"
            onerror="
                this.style.display='none';
                this.nextElementSibling.style.display='flex';
            "
        >

        <span
            class="logo-banco-fallback"
            style="--cor-banco: ${cor};"
        >
            ${sigla}
        </span>
    `;
}

function preencherFiltroBancos() {
    const select =
        document.getElementById("banco");

    if (!select) {
        return;
    }

    bancosFinanceiros.forEach((banco) => {
        const option =
            document.createElement("option");

        option.value = banco.id;
        option.textContent = banco.nome;

        select.appendChild(option);
    });
}

function carregarIndicadoresDemonstrativos() {
    const indicadores = {
        kpiTotalRecebido: 1250000,
        kpiAReceber: 430000,
        kpiEmAtraso: 58000,
        kpiPagoMes: 980000,
        kpiTicketMedio: 4350
    };

    Object.entries(indicadores).forEach(
        ([idElemento, valor]) => {
            preencherTexto(
                idElemento,
                formatarMoeda(valor)
            );
        }
    );
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

function preencherTexto(id, texto) {
    const elemento =
        document.getElementById(id);

    if (elemento) {
        elemento.textContent = texto;
    }
}

function formatarMoeda(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "R$ 0,00";
    }

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
