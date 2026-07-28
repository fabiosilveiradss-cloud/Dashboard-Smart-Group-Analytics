"use strict";

let bancosFinanceiros = [
    {
        id: "banco-do-brasil",
        nome: "Banco do Brasil",
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
                        <p>Movimentações consolidadas</p>
                    </div>
                </div>

                <i class="fa-solid fa-chevron-right card-banco-seta"></i>
            </div>


            <div class="banco-saldo">
                <span>Total movimentado</span>
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

function configurarImportacaoPlanilha() {
    const botao =
        document.getElementById("btnCarregarPlanilha");

    const input =
        document.getElementById("inputPlanilha");

    if (!botao || !input) {
        return;
    }

    botao.addEventListener("click", () => {
        input.click();
    });

    input.addEventListener("change", async () => {
        const arquivo = input.files?.[0];

        if (!arquivo) {
            return;
        }

        try {
            botao.disabled = true;

            atualizarStatusImportacao(
                "Processando a planilha...",
                ""
            );

            const resultado =
                await processarPlanilhaFinanceira(arquivo);

            bancosFinanceiros = resultado.bancos;

            renderizarBancos();
            preencherFiltroBancos(true);
            atualizarDataHora();

            atualizarStatusImportacao(
                `${resultado.quantidadeRegistros} registros importados de ` +
                `${resultado.quantidadeBancos} bancos.`,
                "sucesso"
            );
        } catch (erro) {
            console.error(
                "Erro ao importar planilha:",
                erro
            );

            atualizarStatusImportacao(
                erro.message ||
                "Não foi possível processar a planilha.",
                "erro"
            );
        } finally {
            botao.disabled = false;
            input.value = "";
        }
    });
}

async function processarPlanilhaFinanceira(arquivo) {
    if (typeof XLSX === "undefined") {
        throw new Error(
            "A biblioteca de leitura do Excel não foi carregada."
        );
    }

    const dadosArquivo =
        await arquivo.arrayBuffer();

    const workbook =
        XLSX.read(dadosArquivo, {
            type: "array",
            cellDates: true
        });

    const nomePrimeiraAba =
        workbook.SheetNames[0];

    if (!nomePrimeiraAba) {
        throw new Error(
            "A planilha não possui nenhuma aba."
        );
    }

    const worksheet =
        workbook.Sheets[nomePrimeiraAba];

    const linhas =
        XLSX.utils.sheet_to_json(
            worksheet,
            {
                header: 1,
                defval: "",
                raw: true
            }
        );

    const indiceCabecalho =
        localizarCabecalhoFinanceiro(linhas);

    if (indiceCabecalho === -1) {
        throw new Error(
            "Não foi possível localizar o cabeçalho financeiro."
        );
    }

    const cabecalho =
        linhas[indiceCabecalho];

    const indices =
        localizarColunasFinanceiras(cabecalho);

    const registros =
        linhas
            .slice(indiceCabecalho + 1)
            .filter((linha) => {
                return linha.some((valor) => {
                    return valor !== "" &&
                        valor !== null &&
                        valor !== undefined;
                });
            });

    const bancos =
        agruparMovimentacoesPorBanco(
            registros,
            indices
        );

    if (!bancos.length) {
        throw new Error(
            "Nenhuma movimentação bancária foi encontrada."
        );
    }

    return {
        bancos,
        quantidadeRegistros: registros.length,
        quantidadeBancos: bancos.length
    };
}

function localizarCabecalhoFinanceiro(linhas) {
    return linhas.findIndex((linha) => {
        const textos =
            linha.map((valor) => normalizarTexto(valor));

        const possuiValor =
            textos.includes("vlr liq pago") ||
            textos.includes("valor liquido pago");

        return textos.includes("descricao") &&
            possuiValor;
    });
}

function localizarColunasFinanceiras(cabecalho) {
    const cabecalhoNormalizado =
        cabecalho.map((valor) => normalizarTexto(valor));

    const indiceBanco =
        cabecalhoNormalizado.indexOf("descricao");

    let indiceValor =
        cabecalhoNormalizado.indexOf("vlr liq pago");

    if (indiceValor === -1) {
        indiceValor =
            cabecalhoNormalizado.indexOf("valor liquido pago");
    }

    const indicesAbreviacao = [];

    cabecalhoNormalizado.forEach((valor, indice) => {
        if (valor === "abreviacao") {
            indicesAbreviacao.push(indice);
        }
    });

    const indiceSiglaBanco =
        indicesAbreviacao.length > 1
            ? indicesAbreviacao[1]
            : indicesAbreviacao[0] ?? -1;

    if (indiceBanco === -1 || indiceValor === -1) {
        throw new Error(
            "As colunas Descrição e Vlr.líq.pago não foram encontradas."
        );
    }

    return {
        banco: indiceBanco,
        siglaBanco: indiceSiglaBanco,
        valorLiquidoPago: indiceValor
    };
}

function agruparMovimentacoesPorBanco(
    registros,
    indices
) {
    const agrupamento = new Map();

    registros.forEach((linha) => {
        const nomeOriginal =
            String(linha[indices.banco] || "").trim();

        const siglaOriginal =
            indices.siglaBanco >= 0
                ? String(linha[indices.siglaBanco] || "").trim()
                : "";

        const valor =
            converterNumeroFinanceiro(
                linha[indices.valorLiquidoPago]
            );

        if (!nomeOriginal || valor === 0) {
            return;
        }

        const chave =
            normalizarTexto(nomeOriginal);

        if (!agrupamento.has(chave)) {
            const identidade =
                identificarBanco(
                    nomeOriginal,
                    siglaOriginal
                );

            agrupamento.set(chave, {
                id: identidade.id,
                nome: nomeOriginal,
                saldo: 0,
                totalRecebido: 0,
                totalPago: 0,
                emAberto: 0,
                emAtraso: 0,
                logo: identidade.logo,
                sigla: identidade.sigla,
                cor: identidade.cor
            });
        }

        const banco =
            agrupamento.get(chave);

        banco.saldo += valor;
        banco.totalRecebido += valor;
    });

    return Array.from(agrupamento.values())
        .sort((a, b) => b.saldo - a.saldo);
}

function identificarBanco(
    nomeBanco,
    siglaPlanilha
) {
    const nome =
        normalizarTexto(nomeBanco);

    const catalogo = [
        {
            termos: ["banco do brasil"],
            id: "banco-do-brasil",
            sigla: "BB",
            logo: "assets/bancos/banco-do-brasil.svg",
            cor: "#f6d000"
        },
        {
            termos: ["sicredi"],
            id: "sicredi",
            sigla: "SI",
            logo: "assets/bancos/sicredi.svg",
            cor: "#59a52c"
        },
        {
            termos: ["caixa"],
            id: "caixa",
            sigla: "CX",
            logo: "assets/bancos/caixa.svg",
            cor: "#0074b8"
        },
        {
            termos: ["itau"],
            id: "itau",
            sigla: "IT",
            logo: "assets/bancos/itau.svg",
            cor: "#ec7000"
        },
        {
            termos: ["bradesco"],
            id: "bradesco",
            sigla: "BR",
            logo: "assets/bancos/bradesco.svg",
            cor: "#cc092f"
        },
        {
            termos: ["santander"],
            id: "santander",
            sigla: "ST",
            logo: "assets/bancos/santander.svg",
            cor: "#ec0000"
        },
        {
            termos: ["sicoob"],
            id: "sicoob",
            sigla: "SC",
            logo: "assets/bancos/sicoob.svg",
            cor: "#1d6b55"
        }
    ];

    const encontrado =
        catalogo.find((banco) => {
            return banco.termos.some((termo) => {
                return nome.includes(termo);
            });
        });

    if (encontrado) {
        return encontrado;
    }

    return {
        id: gerarIdentificador(nomeBanco),
        sigla:
            siglaPlanilha ||
            gerarSiglaBanco(nomeBanco),
        logo: "assets/bancos/banco-generico.svg",
        cor: "#1683ff"
    };
}

function converterNumeroFinanceiro(valor) {
    if (typeof valor === "number") {
        return Number.isFinite(valor)
            ? valor
            : 0;
    }

    const texto =
        String(valor || "")
            .trim()
            .replace(/\s/g, "")
            .replace(/R\$/gi, "");

    if (!texto) {
        return 0;
    }

    let normalizado = texto;

    if (
        normalizado.includes(".") &&
        normalizado.includes(",")
    ) {
        normalizado =
            normalizado
                .replace(/\./g, "")
                .replace(",", ".");
    } else if (normalizado.includes(",")) {
        normalizado =
            normalizado.replace(",", ".");
    }

    const numero =
        Number(normalizado);

    return Number.isFinite(numero)
        ? numero
        : 0;
}

function normalizarTexto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[./_()-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function gerarIdentificador(nome) {
    return normalizarTexto(nome)
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}

function gerarSiglaBanco(nome) {
    const palavras =
        String(nome || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    return palavras
        .slice(0, 2)
        .map((palavra) => palavra[0])
        .join("")
        .toUpperCase() || "BK";
}

function atualizarStatusImportacao(
    mensagem,
    tipo
) {
    const container =
        document.getElementById("statusImportacao");

    const texto =
        document.getElementById(
            "textoStatusImportacao"
        );

    if (!container || !texto) {
        return;
    }

    container.hidden = false;

    container.classList.remove(
        "sucesso",
        "erro"
    );

    if (tipo) {
        container.classList.add(tipo);
    }

    texto.textContent = mensagem;
}
