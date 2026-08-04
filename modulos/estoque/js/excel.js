//-----------------------------------------------------
// EXPORTAÇÃO DO ESTOQUE PARA EXCEL
//-----------------------------------------------------

(function () {

    "use strict";

    const CAMPOS_EXPORTACAO = {
        codigo: "Produto",
        descricao: "Desc.completa",
        quantidade: "Qtd.fisica",
        unidade: "UN",
        empresa: "Sig.emp",
        local: "Nome do Local de Estoque",
        familia: "Familia"
    };

    function obterTextoPesquisaAtual() {
        return String(
            document.getElementById("pesquisaProduto")?.value || ""
        )
            .trim()
            .toLowerCase();
    }

    function obterDadosParaExportacao(apenasResultadoAtual) {

        const origem = Array.isArray(window.dadosProdutos)
            ? window.dadosProdutos
            : [];

        if (!apenasResultadoAtual) {
            return [...origem];
        }

        const textoPesquisa = obterTextoPesquisaAtual();

        const dadosComFiltros = typeof obterDadosFiltradosAtuais === "function"
            ? obterDadosFiltradosAtuais()
            : [...origem];

        if (!textoPesquisa) {
            return dadosComFiltros;
        }

        return dadosComFiltros.filter(function (item) {

            const codigo = String(
                item[CAMPOS_EXPORTACAO.codigo] || ""
            ).toLowerCase();

            const descricao = String(
                item[CAMPOS_EXPORTACAO.descricao] || ""
            ).toLowerCase();

            return (
                codigo.includes(textoPesquisa) ||
                descricao.includes(textoPesquisa)
            );
        });
    }

    function consolidarProdutos(dados) {

        const produtos = new Map();

        dados.forEach(function (item) {

            const codigo = String(
                item[CAMPOS_EXPORTACAO.codigo] || ""
            ).trim();

            const descricao = String(
                item[CAMPOS_EXPORTACAO.descricao] || ""
            ).trim();

            const unidade = String(
                item[CAMPOS_EXPORTACAO.unidade] || ""
            ).trim();

            const familia = String(
                item[CAMPOS_EXPORTACAO.familia] || ""
            ).trim();

            const chave = codigo + "||" + descricao + "||" + unidade;

            if (!produtos.has(chave)) {
                produtos.set(chave, {
                    Código: codigo,
                    Produto: descricao,
                    Família: familia,
                    Unidade: unidade,
                    "Saldo Total": 0
                });
            }

            produtos.get(chave)["Saldo Total"] += Number(
                item[CAMPOS_EXPORTACAO.quantidade] || 0
            );
        });

        return [...produtos.values()].sort(function (a, b) {

            const comparacaoDescricao = String(a.Produto)
                .localeCompare(String(b.Produto), "pt-BR", {
                    sensitivity: "base"
                });

            if (comparacaoDescricao !== 0) {
                return comparacaoDescricao;
            }

            return Number(a.Código || 0) - Number(b.Código || 0);
        });
    }

    function montarDetalhamento(dados) {

        return dados
            .map(function (item) {
                return {
                    Código: String(
                        item[CAMPOS_EXPORTACAO.codigo] || ""
                    ).trim(),
                    Produto: String(
                        item[CAMPOS_EXPORTACAO.descricao] || ""
                    ).trim(),
                    Família: String(
                        item[CAMPOS_EXPORTACAO.familia] || ""
                    ).trim(),
                    Empresa: String(
                        item[CAMPOS_EXPORTACAO.empresa] || ""
                    ).trim(),
                    Local: String(
                        item[CAMPOS_EXPORTACAO.local] || ""
                    ).trim(),
                    Quantidade: Number(
                        item[CAMPOS_EXPORTACAO.quantidade] || 0
                    ),
                    Unidade: String(
                        item[CAMPOS_EXPORTACAO.unidade] || ""
                    ).trim()
                };
            })
            .sort(function (a, b) {

                const comparacaoProduto = a.Produto.localeCompare(
                    b.Produto,
                    "pt-BR",
                    { sensitivity: "base" }
                );

                if (comparacaoProduto !== 0) {
                    return comparacaoProduto;
                }

                const comparacaoEmpresa = a.Empresa.localeCompare(
                    b.Empresa,
                    "pt-BR",
                    { sensitivity: "base" }
                );

                if (comparacaoEmpresa !== 0) {
                    return comparacaoEmpresa;
                }

                return a.Local.localeCompare(
                    b.Local,
                    "pt-BR",
                    { sensitivity: "base" }
                );
            });
    }

    function ajustarLarguras(planilha, larguras) {
        planilha["!cols"] = larguras.map(function (largura) {
            return { wch: largura };
        });
    }

    function formatarColunaNumerica(planilha, nomeColuna) {

        if (!planilha["!ref"]) {
            return;
        }

        const intervalo = XLSX.utils.decode_range(planilha["!ref"]);
        const cabecalho = [];

        for (let coluna = intervalo.s.c; coluna <= intervalo.e.c; coluna++) {
            const celula = planilha[
                XLSX.utils.encode_cell({ r: 0, c: coluna })
            ];
            cabecalho[coluna] = celula ? celula.v : "";
        }

        const indice = cabecalho.indexOf(nomeColuna);

        if (indice === -1) {
            return;
        }

        for (let linha = 1; linha <= intervalo.e.r; linha++) {
            const endereco = XLSX.utils.encode_cell({ r: linha, c: indice });
            const celula = planilha[endereco];

            if (celula && typeof celula.v === "number") {
                celula.z = "#,##0.00";
            }
        }
    }

    function normalizarNomeArquivo(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9_-]+/g, "_")
            .replace(/^_+|_+$/g, "")
            .slice(0, 45);
    }

    function obterDataArquivo() {
        const agora = new Date();
        const dia = String(agora.getDate()).padStart(2, "0");
        const mes = String(agora.getMonth() + 1).padStart(2, "0");
        const ano = agora.getFullYear();
        return dia + "-" + mes + "-" + ano;
    }

    function definirEstadoBotao(botao, processando) {

        if (!botao) {
            return;
        }

        if (processando) {
            botao.dataset.textoOriginal = botao.innerHTML;
            botao.disabled = true;
            botao.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gerando Excel...';
            return;
        }

        botao.disabled = false;
        botao.innerHTML = botao.dataset.textoOriginal || botao.innerHTML;
    }

    function exportarEstoque(apenasResultadoAtual, botao) {

        if (typeof XLSX === "undefined") {
            alert("A biblioteca de exportação ainda não foi carregada. Atualize a página e tente novamente.");
            return;
        }

        const dados = obterDadosParaExportacao(apenasResultadoAtual);

        if (dados.length === 0) {
            alert(
                apenasResultadoAtual
                    ? "Nenhum produto foi encontrado na pesquisa ou nos filtros atuais."
                    : "Não existem produtos disponíveis para exportação."
            );
            return;
        }

        definirEstadoBotao(botao, true);

        setTimeout(function () {

            try {
                const consolidado = consolidarProdutos(dados);
                const detalhamento = montarDetalhamento(dados);

                const planilhaConsolidada = XLSX.utils.json_to_sheet(consolidado);
                const planilhaDetalhada = XLSX.utils.json_to_sheet(detalhamento);

                ajustarLarguras(planilhaConsolidada, [14, 52, 24, 12, 18]);
                ajustarLarguras(planilhaDetalhada, [14, 52, 24, 14, 32, 16, 12]);

                formatarColunaNumerica(planilhaConsolidada, "Saldo Total");
                formatarColunaNumerica(planilhaDetalhada, "Quantidade");

                planilhaConsolidada["!autofilter"] = {
                    ref: planilhaConsolidada["!ref"]
                };

                planilhaDetalhada["!autofilter"] = {
                    ref: planilhaDetalhada["!ref"]
                };

                const pastaTrabalho = XLSX.utils.book_new();

                XLSX.utils.book_append_sheet(
                    pastaTrabalho,
                    planilhaConsolidada,
                    "Resumo por Produto"
                );

                XLSX.utils.book_append_sheet(
                    pastaTrabalho,
                    planilhaDetalhada,
                    "Detalhamento"
                );

                let identificador = "Completo";

                if (apenasResultadoAtual) {
                    const pesquisa = normalizarNomeArquivo(
                        document.getElementById("pesquisaProduto")?.value
                    );

                    identificador = pesquisa || "Resultado_Filtrado";
                }

                const nomeArquivo =
                    "Estoque_" +
                    identificador +
                    "_" +
                    obterDataArquivo() +
                    ".xlsx";

                XLSX.writeFile(pastaTrabalho, nomeArquivo, {
                    compression: true
                });

            } catch (erro) {
                console.error("Erro ao exportar o estoque:", erro);
                alert("Não foi possível gerar o Excel. Tente novamente.");
            } finally {
                definirEstadoBotao(botao, false);
            }

        }, 50);
    }

    function iniciarExportacaoEstoque() {

        const botaoTodos = document.getElementById("btnExportarTodos");
        const botaoPesquisa = document.getElementById("btnExportarPesquisa");

        if (botaoTodos) {
            botaoTodos.addEventListener("click", function () {
                exportarEstoque(false, botaoTodos);
            });
        }

        if (botaoPesquisa) {
            botaoPesquisa.addEventListener("click", function () {
                exportarEstoque(true, botaoPesquisa);
            });
        }
    }

    document.addEventListener(
        "DOMContentLoaded",
        iniciarExportacaoEstoque
    );

})();
