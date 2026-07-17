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
            .toLowerCase() || "";

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

    document
        .querySelectorAll(".linha-produto")
        .forEach(linha => {

            const codigo =
                Number(linha.dataset.codigo);

            const textoLinha =
                linha.dataset.texto || "";

            const familiaLinha =
                linha.dataset.familia || "";

            const passaTexto =
                textoLinha.includes(texto);

            const passaFamilia =
                !familia ||
                familiaLinha === familia;

            const passaEmpresaLocal =
                validarEmpresaLocal(
                    codigo,
                    empresa,
                    local
                );

            linha.style.display =
                passaTexto &&
                passaFamilia &&
                passaEmpresaLocal
                    ? "table-row"
                    : "none";
        });

    const dadosAtuais =
        obterDadosFiltradosAtuais();

    const produtosAgrupados =
        agruparProdutos(dadosAtuais);

    atualizarCards(produtosAgrupados);
    atualizarGraficoFamilia(produtosAgrupados);
    atualizarGraficoLocal(dadosAtuais);
}

//-----------------------------------------------------
// VALIDAR EMPRESA E LOCAL
//-----------------------------------------------------

function validarEmpresaLocal(codigo, empresa, local) {

    if (!empresa && !local) {
        return true;
    }

    const locais =
        indiceLocaisPorProduto.get(Number(codigo)) || [];

    return locais.some(item => {

        const okEmpresa =
            !empresa ||
            item["Sig.emp"] === empresa;

        const okLocal =
            !local ||
            item["Nome do Local de Estoque"] === local;

        return okEmpresa && okLocal;
    });
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
