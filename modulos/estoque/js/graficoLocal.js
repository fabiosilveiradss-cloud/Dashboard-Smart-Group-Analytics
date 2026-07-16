//-----------------------------------------------------
// TOP PRODUTOS COM MAIOR ESTOQUE
//-----------------------------------------------------

window.localSelecionado = null;

let dadosAtuaisTopProdutos = [];

//-----------------------------------------------------
// OBTER DESCRIÇÃO
//-----------------------------------------------------

function obterDescricaoProduto(item) {

    const descricao = item?.["Desc.completa"];

    if (
        descricao !== undefined &&
        descricao !== null &&
        String(descricao).trim() !== ""
    ) {
        return String(descricao).trim();
    }

    return "Produto sem descrição";
}

//-----------------------------------------------------
// PROTEGER TEXTO NO HTML
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
// AGRUPAR OS PRODUTOS
//-----------------------------------------------------

function montarResumoTopProdutos(dados) {

    const resumo = {};

    dados.forEach(item => {

        const codigo =
            String(item?.Produto ?? "").trim();

        if (!codigo) {
            return;
        }

        const descricao =
            obterDescricaoProduto(item);

        const quantidade =
            Number(item?.["Qtd.fisica"]) || 0;

        if (!resumo[codigo]) {

            resumo[codigo] = {
                codigo: codigo,
                descricao: descricao,
                unidade: item?.UN || "m",
                quantidade: 0
            };
        }

        resumo[codigo].quantidade += quantidade;

        if (
            resumo[codigo].descricao === "Produto sem descrição" &&
            descricao !== "Produto sem descrição"
        ) {
            resumo[codigo].descricao = descricao;
        }
    });

    return Object.values(resumo)
        .filter(produto => produto.quantidade > 0)
        .sort((a, b) => b.quantidade - a.quantidade);
}

//-----------------------------------------------------
// DESENHAR O RANKING
//-----------------------------------------------------

function desenharTopProdutos() {

    const container =
        document.getElementById("rankingTopProdutos");

    const seletor =
        document.getElementById("quantidadeTopProdutos");

    if (!container) {
        return;
    }

    const limite =
        Number(seletor?.value) || 10;

    const produtos =
        montarResumoTopProdutos(dadosAtuaisTopProdutos)
            .slice(0, limite);

    if (produtos.length === 0) {

        container.innerHTML = `
            <div class="sem-dados">
                Nenhum produto encontrado para os filtros selecionados.
            </div>
        `;

        return;
    }

    const maiorQuantidade =
        produtos[0]?.quantidade || 1;

    container.innerHTML = produtos.map((produto, indice) => {

        const percentual = Math.max(
            2,
            (produto.quantidade / maiorQuantidade) * 100
        );

        return `
            <div class="top-produto-item">

                <div class="top-produto-cabecalho">

                    <div class="top-produto-identificacao">

                        <span class="top-produto-posicao">
                            ${indice + 1}º
                        </span>

                        <div class="top-produto-textos">

                            <strong class="top-produto-codigo">
                                ${escaparTextoTopProdutos(produto.codigo)}
                            </strong>

                            <span
                                class="top-produto-descricao"
                                title="${escaparTextoTopProdutos(produto.descricao)}">

                                ${escaparTextoTopProdutos(produto.descricao)}

                            </span>

                        </div>

                    </div>

                    <span class="top-produto-quantidade">

                        ${formatarQuantidadeTopProdutos(produto.quantidade)}
                        ${escaparTextoTopProdutos(produto.unidade)}

                    </span>

                </div>

                <div class="top-produto-barra-fundo">

                    <div
                        class="top-produto-barra"
                        style="width: ${percentual}%">
                    </div>

                </div>

            </div>
        `;

    }).join("");
}

//-----------------------------------------------------
// FUNÇÃO CHAMADA PELO APP.JS
//-----------------------------------------------------

function atualizarGraficoLocal(dados) {

    dadosAtuaisTopProdutos =
        Array.isArray(dados) ? dados : [];

    desenharTopProdutos();
}

/*
Deixa a função disponível globalmente.
Isso garante que o app.js consiga chamá-la.
*/

window.atualizarGraficoLocal = atualizarGraficoLocal;

//-----------------------------------------------------
// ALTERAÇÃO TOP 5, 10, 15 OU 20
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

console.log("graficoLocal.js carregado corretamente");
