//-----------------------------------------------------
// TOP PRODUTOS COM MAIOR QUANTIDADE EM ESTOQUE
//-----------------------------------------------------

window.localSelecionado = null;

let dadosAtuaisTopProdutos = [];

//-----------------------------------------------------
// LOCALIZAR DESCRIÇÃO DO PRODUTO
//-----------------------------------------------------

function obterDescricaoProduto(item) {

    return (
        item["Descrição do Produto"] ||
        item["Descricao do Produto"] ||
        item["Desc. Produto"] ||
        item["Desc.produto"] ||
        item["Descrição"] ||
        item["Descricao"] ||
        item["Nome do Produto"] ||
        item["Produto Descrição"] ||
        ""
    );

}

//-----------------------------------------------------
// PROTEGER TEXTO INSERIDO NO HTML
//-----------------------------------------------------

function escaparTextoTopProdutos(texto) {

    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

//-----------------------------------------------------
// FORMATAR QUANTIDADE
//-----------------------------------------------------

function formatarQuantidadeTopProdutos(valor) {

    const numero = Number(valor) || 0;

    if (typeof formatarNumero === "function") {
        return formatarNumero(numero);
    }

    return numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3
    });

}

//-----------------------------------------------------
// AGRUPAR E SOMAR PRODUTOS
//-----------------------------------------------------

function montarResumoTopProdutos(dados) {

    const resumo = {};

    dados.forEach(item => {

        const codigo = String(item["Produto"] ?? "").trim();

        if (!codigo) {
            return;
        }

        const descricao = obterDescricaoProduto(item);
        const quantidade = Number(item["Qtd.fisica"]) || 0;

        if (!resumo[codigo]) {

            resumo[codigo] = {
                codigo: codigo,
                descricao: descricao,
                quantidade: 0
            };

        }

        resumo[codigo].quantidade += quantidade;

        /*
        Mantém a primeira descrição válida encontrada.
        */

        if (!resumo[codigo].descricao && descricao) {
            resumo[codigo].descricao = descricao;
        }

    });

    return Object.values(resumo)
        .filter(produto => produto.quantidade > 0)
        .sort((a, b) => b.quantidade - a.quantidade);

}

//-----------------------------------------------------
// DESENHAR RANKING
//-----------------------------------------------------

function desenharTopProdutos() {

    const container =
        document.getElementById("rankingTopProdutos");

    const seletor =
        document.getElementById("quantidadeTopProdutos");

    if (!container) {
        return;
    }

    const quantidadeExibida =
        Number(seletor?.value) || 10;

    const produtos =
        montarResumoTopProdutos(dadosAtuaisTopProdutos)
            .slice(0, quantidadeExibida);

    if (produtos.length === 0) {

        container.innerHTML = `
            <div class="sem-dados">
                Nenhum produto encontrado para os filtros selecionados.
            </div>
        `;

        return;
    }

    const maiorQuantidade =
        produtos[0].quantidade || 1;

    container.innerHTML = produtos.map((produto, indice) => {

        const percentual =
            Math.max(
                2,
                (produto.quantidade / maiorQuantidade) * 100
            );

        const posicao = indice + 1;

        const descricao =
            produto.descricao || "Produto sem descrição";

        return `

            <div class="top-produto-item">

                <div class="top-produto-cabecalho">

                    <div class="top-produto-identificacao">

                        <span class="top-produto-posicao">
                            ${posicao}º
                        </span>

                        <div class="top-produto-textos">

                            <strong
                                class="top-produto-codigo"
                                title="${escaparTextoTopProdutos(produto.codigo)}">

                                ${escaparTextoTopProdutos(produto.codigo)}

                            </strong>

                            <span
                                class="top-produto-descricao"
                                title="${escaparTextoTopProdutos(descricao)}">

                                ${escaparTextoTopProdutos(descricao)}

                            </span>

                        </div>

                    </div>

                    <span class="top-produto-quantidade">

                        ${formatarQuantidadeTopProdutos(produto.quantidade)} m

                    </span>

                </div>

                <div class="top-produto-barra-fundo">

                    <div
                        class="top-produto-barra"
                        style="width:${percentual}%">
                    </div>

                </div>

            </div>

        `;

    }).join("");

}

//-----------------------------------------------------
// FUNÇÃO UTILIZADA PELO DASHBOARD
//-----------------------------------------------------

function atualizarGraficoLocal(dados) {

    /*
    Mantivemos o nome atualizarGraficoLocal para não
    quebrar as chamadas feitas nos outros arquivos.
    */

    dadosAtuaisTopProdutos =
        Array.isArray(dados) ? dados : [];

    desenharTopProdutos();

}

//-----------------------------------------------------
// ALTERAR TOP 5, 10, 15 OU 20
//-----------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

    const seletor =
        document.getElementById("quantidadeTopProdutos");

    if (!seletor) {
        return;
    }

    seletor.addEventListener("change", function () {

        desenharTopProdutos();

    });

});
