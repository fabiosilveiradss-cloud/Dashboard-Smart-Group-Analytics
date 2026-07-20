//-----------------------------------------------------
// TABELA DE PRODUTOS
//-----------------------------------------------------

function atualizarTabela(dados) {

    const tbody =
        document.getElementById("tabelaProdutos");

    const html = dados.map(item => {

        const codigo = Number(item.Produto);
        const familia = item.Familia;

        const descricao =
            item["Desc.completa"] || "Produto sem descrição";

        const unidade =
            item.UN || "";

        return `
            <tr
                class="linha-produto"
                data-codigo="${codigo}"
                data-familia="${familia}"
                data-texto="${String(
                    item.Produto + " " + descricao
                ).toLowerCase()}">

                <td>${item.Produto}</td>

                <td>${descricao}</td>

                <td>
                    ${formatarNumero(item["Qtd.fisica"])}
                    ${unidade}
                </td>

            </tr>
        `;

    }).join("");

    tbody.innerHTML = html;
}

//-----------------------------------------------------
// APLICAR FILTROS NA TABELA
//-----------------------------------------------------

function aplicarFiltrosTabela() {

    const texto =
        document.getElementById("pesquisaProduto")
            ?.value
            .toLowerCase()
            .trim() || "";

    const dadosAtuais =
        obterDadosFiltradosAtuais();

    let produtosAgrupados =
        agruparProdutos(dadosAtuais);

    if (texto) {

        produtosAgrupados =
            produtosAgrupados.filter(item => {

                const codigo =
                    String(item.Produto || "")
                        .toLowerCase();

                const descricao =
                    String(
                        item["Desc.completa"] || ""
                    ).toLowerCase();

                return (
                    codigo.includes(texto) ||
                    descricao.includes(texto)
                );
            });
    }

    dadosFiltrados =
        produtosAgrupados;

    window.dadosFiltrados =
        produtosAgrupados;

    atualizarCards(
        produtosAgrupados
    );

    atualizarGraficoFamilia(
        produtosAgrupados
    );

    atualizarGraficoLocal(
        dadosAtuais
    );

    atualizarTabela(
        produtosAgrupados
    );
}


//-----------------------------------------------------
// OBTER DADOS FILTRADOS
//-----------------------------------------------------

function obterDadosFiltradosAtuais() {

    const empresa =
        document.getElementById("filtroEmpresa")
            ?.value || "";

    const localSelect =
        document.getElementById("filtroLocal")
            ?.value || "";

    const localGrafico =
        window.localSelecionado || "";

    const local =
        localGrafico || localSelect;

    const familia =
        window.familiaSelecionada || "";

    return dadosProdutos.filter(item => {

        const okEmpresa =
            !empresa ||
            item["Sig.emp"] === empresa;

        const okLocal =
            !local ||
            item["Nome do Local de Estoque"] === local;

        const okFamilia =
            !familia ||
            item.Familia === familia;

        return (
            okEmpresa &&
            okLocal &&
            okFamilia
        );
    });
}
