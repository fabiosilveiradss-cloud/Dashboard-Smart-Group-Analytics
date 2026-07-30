"use strict";


/*
 * Resolve a instituição financeira sem misturar as duas
 * cooperativas Sicoob existentes na planilha.
 *
 * Desc. Banco costuma trazer apenas "SICOOB".
 * Desc. Local de Cobrança traz a cooperativa específica.
 */
function resolverBancoFinanceiro(
    bancoOriginal,
    localCobranca
) {
    const banco =
        normalizarTexto(bancoOriginal);

    const local =
        normalizarTexto(localCobranca);

    if (
        local.includes("sicoob maxi credito") ||
        local.includes("maxi credito") ||
        local.includes("maxicredito")
    ) {
        if (!banco || banco.includes("sicoob")) {
            return "Sicoob MaxiCrédito";
        }
    }

    if (
        local.includes("sicoob vale sul") ||
        local.includes("vale sul") ||
        local.includes("vale do sul")
    ) {
        if (!banco || banco.includes("sicoob")) {
            return "Sicoob Vale Sul";
        }
    }

    if (
        banco === "bb" ||
        banco.includes("banco do brasil")
    ) {
        return "Banco do Brasil";
    }

    if (banco.includes("itau")) {
        return "Itaú";
    }

    if (banco.includes("sicredi")) {
        return "Sicredi";
    }

    if (banco.includes("caixa")) {
        return "Caixa Econômica Federal";
    }

    if (banco.includes("bradesco")) {
        return "Bradesco";
    }

    if (banco.includes("santander")) {
        return "Santander";
    }

    if (banco.includes("integra")) {
        return "INTEGRA";
    }

    if (banco.includes("sicoob")) {
        return "Sicoob";
    }

    /*
     * Quando Desc. Banco está vazio, utiliza o local
     * somente se ele realmente identificar uma instituição.
     */
    if (!banco) {
        if (local.includes("banco do brasil")) {
            return "Banco do Brasil";
        }

        if (local.includes("itau")) {
            return "Itaú";
        }

        if (local.includes("sicredi")) {
            return "Sicredi";
        }

        if (local.includes("caixa")) {
            return "Caixa Econômica Federal";
        }

        if (local.includes("bradesco")) {
            return "Bradesco";
        }

        if (local.includes("santander")) {
            return "Santander";
        }
    }

    return String(
        bancoOriginal ||
        "Não informado"
    ).trim() || "Não informado";
}

function identificarBancoFinanceiro(nomeBanco) {
    const nome =
        normalizarTexto(nomeBanco);

    if (
        nome.includes("sicoob maxi credito") ||
        nome.includes("maxi credito") ||
        nome.includes("maxicredito")
    ) {
        return {
            id: "sicoob-maxicredito",
            sigla: "SM",
            logo:
                "assets/bancos/sicoob-maxicredito.png",
            cor: "#00535a"
        };
    }

    if (
        nome.includes("sicoob vale sul") ||
        nome.includes("vale sul") ||
        nome.includes("vale do sul")
    ) {
        return {
            id: "sicoob-vale-sul",
            sigla: "SV",
            logo:
                "assets/bancos/sicoob-vale-sul.png",
            cor: "#007f62"
        };
    }

    if (
        nome === "bb" ||
        nome.includes("banco do brasil")
    ) {
        return {
            id: "banco-do-brasil",
            sigla: "BB",
            logo:
                "assets/bancos/banco-do-brasil.png",
            cor: "#f6d000"
        };
    }

    if (nome.includes("itau")) {
        return {
            id: "itau",
            sigla: "IT",
            logo:
                "assets/bancos/itau.png",
            cor: "#ec7000"
        };
    }

    /*
     * Para bancos ainda sem imagem própria, mantém
     * o catálogo já existente no projeto.
     */
    return identificarBanco(nomeBanco, "");
}

/* Processamento e padronização dos lançamentos da planilha. */

function localizarCabecalhoFinanceiro(linhas) {
    return linhas.findIndex((linha) => {
        const cabecalho = linha.map(normalizarTexto);
        return cabecalho.includes("razao social") &&
            cabecalho.includes("vlr docto") &&
            cabecalho.includes("vlr liq pago") &&
            cabecalho.includes("descr tp cad");
    });
}

function localizarColunasCompletas(cabecalho) {
    const normalizado = cabecalho.map(normalizarTexto);

    const indice = (...nomes) => {
        for (const nome of nomes) {
            const posicao = normalizado.indexOf(normalizarTexto(nome));
            if (posicao >= 0) return posicao;
        }
        return -1;
    };

    const colunas = {
        empresa: indice("Sig.emp"),
        especie: indice("Esp"),
        sigla: indice("Sigla"),
        codigoPessoa: indice("Cli/for"),
        razaoSocial: indice("Razão social"),
        nomeFantasia: indice("Nome fantasia"),
        documento: indice("Documento"),
        dataMovimento: indice("Dt.movto"),
        parcela: indice("Dsd"),
        tipoDocumento: indice("Tp.doc"),
        descricaoTipoDocumento: indice("Tp.docto"),
        valorDocumento: indice("Vlr.docto"),
        vencimento: indice("Vencimento"),
        dataPagamento: indice("Dt.pgto"),
        juros: indice("Juros"),
        descontos: indice("Descontos"),
        localCobranca: indice("Desc. Local de Cobrança"),
        dataFluxo: indice("Dt.flx.cx"),
        codigoRepresentante: indice("Cód.repres"),
        representante: indice("Desc. Representante"),
        situacaoCobranca: indice("Desc.sit.cobr"),
        codigoBanco: indice("Cx./cta.corr.ent.adiant./pgto"),
        banco: indice("Desc. Banco"),
        codigoPlano: indice("1° cta.planej.finan"),
        planoFinanceiro: indice("Desc. Conta Planejamento"),
        valorLiquidoPago: indice("Vlr.líq.pago"),
        centroCusto: indice("DES. CENTRO DE CUSTO"),
        historicoFinanceiro: indice("Desc.hist.financ"),
        tipoCadastro: indice("Descr.Tp.cad")
    };

    const obrigatorias = [
        "razaoSocial", "valorDocumento", "vencimento",
        "dataPagamento", "valorLiquidoPago", "tipoCadastro"
    ];

    const ausentes = obrigatorias.filter((chave) => colunas[chave] < 0);
    if (ausentes.length) {
        throw new Error(
            "Colunas obrigatórias não encontradas: " + ausentes.join(", ")
        );
    }

    return colunas;
}

function criarLancamento(linha, colunas, numeroLinha) {
    const valor = (chave) =>
        colunas[chave] >= 0 ? linha[colunas[chave]] : "";

    const tipoOriginal = normalizarTexto(valor("tipoCadastro"));
    let tipoCadastro = "";

    if (tipoOriginal.includes("cliente")) tipoCadastro = "cliente";
    if (tipoOriginal.includes("fornecedor")) tipoCadastro = "fornecedor";
    if (!tipoCadastro) return null;

    const dataPagamento = converterDataExcel(valor("dataPagamento"));
    const vencimento = converterDataExcel(valor("vencimento"));
    const dataMovimento = converterDataExcel(valor("dataMovimento"));
    const dataFluxo = converterDataExcel(valor("dataFluxo"));

    const valorDocumento = Math.abs(converterNumeroFinanceiro(valor("valorDocumento")));
    const valorLiquidoPago = Math.abs(converterNumeroFinanceiro(valor("valorLiquidoPago")));
    const juros = Math.abs(converterNumeroFinanceiro(valor("juros")));
    const descontos = Math.abs(converterNumeroFinanceiro(valor("descontos")));

    const pago = Boolean(dataPagamento) || valorLiquidoPago > 0;
    const hoje = inicioDoDia(new Date());
    const atrasado = !pago && vencimento && inicioDoDia(vencimento) < hoje;

    return {
        id: `linha-${numeroLinha}`,
        numeroLinha,
        empresa: String(valor("empresa") || "").trim(),
        especie: String(valor("especie") || "").trim(),
        sigla: String(valor("sigla") || "").trim(),
        codigoPessoa: String(valor("codigoPessoa") || "").trim(),
        razaoSocial: String(valor("razaoSocial") || "Não informado").trim(),
        nomeFantasia: String(valor("nomeFantasia") || "").trim(),
        documento: String(valor("documento") || "").trim(),
        parcela: String(valor("parcela") || "").trim(),
        tipoDocumento: String(valor("tipoDocumento") || "").trim(),
        descricaoTipoDocumento: String(valor("descricaoTipoDocumento") || "").trim(),
        dataMovimento,
        vencimento,
        dataPagamento,
        dataFluxo,
        valorDocumento,
        valorLiquidoPago,
        juros,
        descontos,
        bancoOriginal:
            String(
                valor("banco") ||
                ""
            ).trim(),

        localCobranca:
            String(
                valor("localCobranca") ||
                ""
            ).trim(),

        banco:
            resolverBancoFinanceiro(
                valor("banco"),
                valor("localCobranca")
            ),

        codigoBanco:
            String(
                valor("codigoBanco") ||
                ""
            ).trim(),
        representante: String(
            valor("representante") ||
            valor("codigoRepresentante") ||
            "Não informado"
        ).trim(),
        codigoRepresentante: String(valor("codigoRepresentante") || "").trim(),
        planoFinanceiro: String(
            valor("planoFinanceiro") ||
            valor("historicoFinanceiro") ||
            "Não informado"
        ).trim(),
        historicoFinanceiro: String(valor("historicoFinanceiro") || "").trim(),
        centroCusto: String(valor("centroCusto") || "").trim(),
        situacaoCobranca: String(valor("situacaoCobranca") || "").trim(),
        tipoCadastro,
        pago,
        atrasado,
        situacao: pago ? "pago" : atrasado ? "atrasado" : "aberto"
    };
}

function agruparBancosDosLancamentos(lancamentos) {
    const mapa = new Map();

    lancamentos.forEach((item) => {
        if (normalizarTexto(item.banco) === "nao informado") return;

        const chave = normalizarTexto(item.banco);
        if (!mapa.has(chave)) {
            const identidade = identificarBancoFinanceiro(item.banco);
            mapa.set(chave, {
                id: identidade.id,
                nome: item.banco,
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

        const banco = mapa.get(chave);

        if (item.tipoCadastro === "cliente") {
            if (item.pago) banco.totalRecebido += item.valorLiquidoPago;
            if (!item.pago) banco.emAberto += item.valorDocumento;
            if (item.atrasado) banco.emAtraso += item.valorDocumento;
        } else if (item.tipoCadastro === "fornecedor" && item.pago) {
            banco.totalPago += item.valorLiquidoPago;
        }

        banco.saldo = banco.totalRecebido - banco.totalPago;
    });

    return [...mapa.values()].sort(
        (a, b) => Math.abs(b.saldo) - Math.abs(a.saldo)
    );
}

