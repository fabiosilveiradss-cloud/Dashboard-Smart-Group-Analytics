"use strict";

/* Aba Bancos e painel de detalhes. */

/*
 * Identidade visual dos bancos.
 * Os caminhos são relativos ao index.html do Financeiro.
 */
function obterIdentidadeVisualBanco(banco) {
    const nomeOriginal =
        banco?.nome ||
        banco?.descricao ||
        "";

    const nome =
        normalizarTexto(nomeOriginal);

    const identidade = {
        nome:
            String(nomeOriginal || "Banco")
                .trim(),
        logo:
            banco?.logo || "",
        sigla:
            banco?.sigla || "BK"
    };

    if (
        nome === "bb" ||
        nome.includes("banco do brasil")
    ) {
        return {
            ...identidade,
            nome: "Banco do Brasil",
            sigla: "BB",
            logo:
                "assets/bancos/banco-do-brasil.png"
        };
    }

    if (nome.includes("itau")) {
        return {
            ...identidade,
            nome: "Itaú",
            sigla: "IT",
            logo:
                "assets/bancos/itau.png"
        };
    }

    if (
        nome.includes("maxicredito") ||
        nome.includes("maxi credito")
    ) {
        return {
            ...identidade,
            nome: "Sicoob MaxiCrédito",
            sigla: "SM",
            logo:
                "assets/bancos/sicoob-maxicredito.png"
        };
    }

    if (
        nome.includes("vale sul") ||
        nome.includes("vale do sul")
    ) {
        return {
            ...identidade,
            nome: "Sicoob Vale Sul",
            sigla: "SV",
            logo:
                "assets/bancos/sicoob-vale-sul.png"
        };
    }

    if (nome.includes("sicoob")) {
        return {
            ...identidade,
            nome: "Sicoob",
            sigla: "SC"
        };
    }

    return identidade;
}

function prepararBancoParaExibicao(
    banco,
    totalRecebidoGeral
) {
    const identidade =
        obterIdentidadeVisualBanco(banco);

    const recebido =
        Number(banco.totalRecebido || 0);

    const quantidadeTitulos =
        Number(
            banco.quantidadeTitulos ||
            banco.totalTitulos ||
            banco.quantidade ||
            0
        );

    return {
        ...banco,
        ...identidade,

        quantidadeTitulos,

        participacao:
            totalRecebidoGeral > 0
                ? recebido /
                    totalRecebidoGeral *
                    100
                : 0
    };
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

    const totalRecebidoGeral =
        bancosFinanceiros.reduce(
            (total, banco) =>
                total +
                Number(
                    banco.totalRecebido || 0
                ),
            0
        );

    const bancosExibicao =
        bancosFinanceiros.map(
            (banco) =>
                prepararBancoParaExibicao(
                    banco,
                    totalRecebidoGeral
                )
        );

    bancosExibicao.forEach((banco) => {
        const card =
            document.createElement("button");

        card.type = "button";
        card.className = "card-banco";

        const percentual =
            banco.participacao.toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                }
            );

        const textoTitulos =
            banco.quantidadeTitulos > 0
                ? `${banco.quantidadeTitulos} títulos`
                : "Títulos consolidados";

        card.innerHTML = `
            <div class="card-banco-topo">
                <div class="banco-identidade">
                    <div class="banco-logo">
                        ${criarLogoBanco(banco)}
                    </div>

                    <div>
                        <h3>${escaparHtml(banco.nome)}</h3>
                        <p>${escaparHtml(textoTitulos)}</p>
                    </div>
                </div>

                <i class="fa-solid fa-chevron-right card-banco-seta"></i>
            </div>

            <div class="banco-saldo">
                <span>Recebido no período</span>
                <strong>${formatarMoeda(banco.totalRecebido)}</strong>
            </div>

            <div class="banco-rodape">
                <span>
                    <i class="fa-solid fa-chart-pie"></i>
                    Participação: ${percentual}%
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
            (total, banco) =>
                total +
                Number(banco.saldo || 0),
            0
        );

    if (saldoTotal) {
        saldoTotal.textContent =
            formatarMoeda(soma);
    }

    if (quantidade) {
        quantidade.textContent =
            `${bancosFinanceiros.length} bancos carregados`;
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

    const estiloImagem =
        caminho
            ? ""
            : "display:none;";

    const estiloFallback =
        caminho
            ? ""
            : "display:flex;";

    return `
        <img
            src="${caminho}"
            alt="Logotipo ${escaparHtml(banco.nome)}"
            class="${classe}"
            style="${estiloImagem}"
            onerror="
                this.style.display='none';
                this.nextElementSibling.style.display='flex';
            "
        >

        <span
            class="logo-banco-fallback"
            style="--cor-banco: ${cor}; ${estiloFallback}"
        >
            ${sigla}
        </span>
    `;
}

