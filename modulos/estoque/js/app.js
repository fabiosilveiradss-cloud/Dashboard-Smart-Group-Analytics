//-----------------------------------------------------
// CONFIGURAÇÃO DA API DE ESTOQUE
//-----------------------------------------------------

const URL_API_ESTOQUE =
"https://script.google.com/macros/s/AKfycbwYonNQTMjuZSmtN3c7oaweWCMIDPDu3nCxg9cEL4KzCqpJCUwPYUoee61ctLtDwzyiDQ/exec";


//-----------------------------------------------------
// VARIÁVEIS GLOBAIS
//-----------------------------------------------------

let dadosProdutos = [];
let dadosFiltrados = [];
let indiceLocaisPorProduto = new Map();

window.dadosProdutos = dadosProdutos;
window.dadosFiltrados = dadosFiltrados;

console.log("APP ESTOQUE INICIOU");


//-----------------------------------------------------
// CARREGAMENTO AUTOMÁTICO VIA JSONP
//-----------------------------------------------------

function carregarEstoqueAutomaticamente() {

    atualizarTextoCarregamento(
        "⏳ Carregando dados do estoque..."
    );

    const nomeCallback =
        "receberDadosEstoque_" + Date.now();

    const script =
        document.createElement("script");

    const timeout = setTimeout(function () {

        removerScriptJsonp(script, nomeCallback);

        mostrarErroCarregamento(
            "Tempo limite excedido ao carregar o estoque."
        );

    }, 30000);


    window[nomeCallback] = function (resultado) {

        clearTimeout(timeout);

        removerScriptJsonp(
            script,
            nomeCallback
        );

        try {

            if (
                !resultado ||
                !Array.isArray(resultado.dados)
            ) {

                throw new Error(
                    "A API não retornou dados válidos."
                );
            }

            prepararDadosEstoque(
                resultado.dados
            );

            atualizarStatusRelatorio(
                resultado.atualizadoEmISO,
                resultado.atualizadoEm
            );

            console.log(
                "Dados do estoque carregados:",
                resultado.dados.length
            );

            console.log(
                "Arquivo de origem:",
                resultado.arquivoOrigem
            );

        } catch (erro) {

            console.error(
                "Erro ao preparar o estoque:",
                erro
            );

            mostrarErroCarregamento(
                erro.message
            );
        }
    };


    script.onerror = function () {

        clearTimeout(timeout);

        removerScriptJsonp(
            script,
            nomeCallback
        );

        mostrarErroCarregamento(
            "Não foi possível acessar a API de estoque."
        );
    };


    script.src =
        URL_API_ESTOQUE +
        "?callback=" +
        encodeURIComponent(nomeCallback) +
        "&t=" +
        Date.now();

    document.body.appendChild(script);
}


//-----------------------------------------------------
// PREPARAR OS DADOS RECEBIDOS
//-----------------------------------------------------

function prepararDadosEstoque(dadosRecebidos) {

    dadosProdutos =
        dadosRecebidos.map(function (item) {

            const produto = {
                ...item
            };

            produto["Qtd.fisica"] =
                converterNumeroBrasileiro(
                    produto["Qtd.fisica"]
                );

            produto.Familia =
                obterFamilia(
                    produto["Desc.completa"]
                );

            return produto;
        });

    window.dadosProdutos =
        dadosProdutos;

    indiceLocaisPorProduto =
        criarIndiceLocais(
            dadosProdutos
        );

    window.indiceLocaisPorProduto =
        indiceLocaisPorProduto;

    const produtosAgrupados =
        agruparProdutos(
            dadosProdutos
        );

    dadosFiltrados =
        produtosAgrupados;

    window.dadosFiltrados =
        dadosFiltrados;

    carregarDashboard(
        produtosAgrupados
    );
}


//-----------------------------------------------------
// CONVERTER NÚMERO DO RELATÓRIO
//-----------------------------------------------------

function converterNumeroBrasileiro(valor) {

    if (
        typeof valor === "number"
    ) {
        return valor;
    }

    const texto =
        String(valor || "")
            .trim();

    if (!texto) {
        return 0;
    }

    const normalizado =
        texto
            .replace(/\./g, "")
            .replace(",", ".");

    const numero =
        Number(normalizado);

    return Number.isFinite(numero)
        ? numero
        : 0;
}


//-----------------------------------------------------
// CENTRAL DO DASHBOARD
//-----------------------------------------------------

function carregarDashboard(dadosAgrupados) {

    console.log(
        "CHEGOU NA CENTRAL DO ESTOQUE"
    );

    dadosFiltrados =
        dadosAgrupados;

    window.dadosFiltrados =
        dadosFiltrados;

    /*
    Os filtros Empresa e Local precisam ser
    preenchidos com os dados originais, pois os
    produtos agrupados podem não possuir todos
    os locais e empresas.
    */

    preencherFiltros(
        dadosProdutos
    );

    atualizarCards(
        dadosAgrupados
    );

    atualizarGraficoLocal(
        dadosAgrupados
    );

    atualizarGraficoFamilia(
        dadosAgrupados
    );

    atualizarTabela(
        dadosAgrupados
    );
}


//-----------------------------------------------------
// ÍNDICE DE LOCAIS POR PRODUTO
//-----------------------------------------------------

function criarIndiceLocais(dados) {

    const indice =
        new Map();

    dados.forEach(function (item) {

        const codigo =
            String(
                item.Produto || ""
            ).trim();

        if (!indice.has(codigo)) {

            indice.set(
                codigo,
                []
            );
        }

        indice
            .get(codigo)
            .push(item);
    });

    return indice;
}


//-----------------------------------------------------
// STATUS DE ATUALIZAÇÃO
//-----------------------------------------------------

function atualizarStatusRelatorio(
    dataISO,
    dataFormatada
) {

    const elemento =
        document.getElementById(
            "ultimaAtualizacao"
        );

    if (!elemento) {
        return;
    }

    if (!dataISO) {

        elemento.textContent =
            dataFormatada
                ? "🟢 Dados atualizados em " +
                  dataFormatada
                : "⚠️ Data de atualização indisponível";

        return;
    }

    const dataAtualizacao =
        new Date(dataISO);

    const dataExibicao =
    dataAtualizacao.toLocaleDateString("pt-BR");

    if (
        Number.isNaN(
            dataAtualizacao.getTime()
        )
    ) {

        elemento.textContent =
            "🟢 Dados atualizados em " +
            (dataFormatada || "--");

        return;
    }

    const agora =
        new Date();

    const diferencaMinutos =
        Math.max(
            0,
            Math.floor(
                (
                    agora.getTime() -
                    dataAtualizacao.getTime()
                ) / 60000
            )
        );

    if (diferencaMinutos < 60) {

        const dataExibicao =
    dataAtualizacao.toLocaleDateString("pt-BR");

elemento.textContent =
    diferencaMinutos <= 1
        ? "📅 " + dataExibicao +
          " — 🟢 Dados atualizados agora"
        : "📅 " + dataExibicao +
          " — 🟢 Dados atualizados há " +
          diferencaMinutos +
          " minutos";

        return;
    }

    const diferencaHoras =
        Math.floor(
            diferencaMinutos / 60
        );

    const minutosRestantes =
        diferencaMinutos % 60;

  const dataExibicao =
    dataAtualizacao.toLocaleDateString("pt-BR");

elemento.textContent =
    "📅 " + dataExibicao +
    " — 🔴 Relatório desatualizado há " +
    diferencaHoras +
        (
            diferencaHoras === 1
                ? " hora"
                : " horas"
        ) +
        (
            minutosRestantes > 0
                ? " e " +
                  minutosRestantes +
                  " minutos"
                : ""
        );
}


//-----------------------------------------------------
// MENSAGENS DE CARREGAMENTO
//-----------------------------------------------------

function atualizarTextoCarregamento(
    mensagem
) {

    const elemento =
        document.getElementById(
            "ultimaAtualizacao"
        );

    if (elemento) {

        elemento.textContent =
            mensagem;
    }
}


function mostrarErroCarregamento(
    mensagem
) {

    console.error(
        "Erro ao carregar estoque:",
        mensagem
    );

    atualizarTextoCarregamento(
        "🔴 Erro ao carregar os dados"
    );

    const ranking =
        document.getElementById(
            "rankingTopProdutos"
        );

    if (ranking) {

        ranking.innerHTML =
            '<div class="sem-dados">' +
            mensagem +
            "</div>";
    }
}


//-----------------------------------------------------
// LIMPEZA DO JSONP
//-----------------------------------------------------

function removerScriptJsonp(
    script,
    nomeCallback
) {

    if (
        script &&
        script.parentNode
    ) {

        script.parentNode.removeChild(
            script
        );
    }

    try {

        delete window[nomeCallback];

    } catch (erro) {

        window[nomeCallback] =
            undefined;
    }
}


//-----------------------------------------------------
// EVENTOS DOS FILTROS
//-----------------------------------------------------

document
    .getElementById(
        "pesquisaProduto"
    )
    .addEventListener(
        "input",
        aplicarFiltrosTabela
    );


document
    .getElementById(
        "filtroEmpresa"
    )
    .addEventListener(
        "change",
        aplicarFiltrosTabela
    );


document
    .getElementById(
        "filtroLocal"
    )
    .addEventListener(
        "change",
        aplicarFiltrosTabela
    );


//-----------------------------------------------------
// INICIAR AUTOMATICAMENTE
//-----------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    carregarEstoqueAutomaticamente
);

console.log(
    "APP.JS DO ESTOQUE CARREGADO"
);
