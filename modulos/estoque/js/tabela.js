//-----------------------------------------------------
// TABELA
//-----------------------------------------------------

function atualizarTabela(dados){

    const tbody = document.getElementById("tabelaProdutos");

    const html = dados.map(item => {

        const codigo = Number(item.Produto);
        const familia = item.Familia;

        return `
            <tr class="linha-produto"
                data-codigo="${codigo}"
                data-familia="${familia}"
                data-texto="${String(item.Produto + ' ' + item["Desc.completa"]).toLowerCase()}">

                <td>
                    <button class="btnExpandir" onclick="expandirProduto(this, ${codigo})">
                        +
                    </button>
                </td>

                <td>${item.Produto}</td>
                <td>${item["Desc.completa"]}</td>
                <td>${formatarNumero(item["Qtd.fisica"])} ${item.UN}</td>

            </tr>
        `;

    }).join("");

    tbody.innerHTML = html;

}

function aplicarFiltrosTabela(){

    const texto = document.getElementById("pesquisaProduto")?.value.toLowerCase() || "";
    const empresa = document.getElementById("filtroEmpresa")?.value || "";
    const localSelect = document.getElementById("filtroLocal")?.value || "";
    const localGrafico = window.localSelecionado || "";
    const local = localGrafico || localSelect;
    const familia = window.familiaSelecionada || "";

    document.querySelectorAll(".linha-detalhes").forEach(linha => linha.remove());

    document.querySelectorAll(".btnExpandir").forEach(btn => {
        btn.textContent = "+";
    });

    document.querySelectorAll(".linha-produto").forEach(linha => {

        const codigo = Number(linha.dataset.codigo);
        const textoLinha = linha.dataset.texto;
        const familiaLinha = linha.dataset.familia;

        const passaTexto = textoLinha.includes(texto);
        const passaFamilia = !familia || familiaLinha === familia;
        const passaEmpresaLocal = validarEmpresaLocal(codigo, empresa, local);

        linha.style.display =
            passaTexto && passaFamilia && passaEmpresaLocal
            ? "table-row"
            : "none";

    });

    const dadosAtuais = obterDadosFiltradosAtuais();

    const produtosAgrupados = agruparProdutos(dadosAtuais);

    atualizarCards(produtosAgrupados);
    atualizarGraficoFamilia(produtosAgrupados);
    atualizarGraficoLocal(dadosAtuais);

}

function validarEmpresaLocal(codigo, empresa, local){

    if(!empresa && !local) return true;

    const locais = indiceLocaisPorProduto.get(Number(codigo)) || [];

    return locais.some(item => {

        const okEmpresa = !empresa || item["Sig.emp"] === empresa;
        const okLocal = !local || item["Nome do Local de Estoque"] === local;

        return okEmpresa && okLocal;

    });

}

function expandirProduto(botao, codigo){

    const linhaProduto = botao.closest("tr");
    const proximaLinha = linhaProduto.nextElementSibling;

    if(proximaLinha && proximaLinha.classList.contains("linha-detalhes")){

        proximaLinha.remove();
        botao.textContent = "+";
        return;

    }

    document.querySelectorAll(".linha-detalhes").forEach(linha => linha.remove());

    document.querySelectorAll(".btnExpandir").forEach(btn => {
        btn.textContent = "+";
    });

    const detalhe = document.createElement("tr");
    detalhe.className = "linha-detalhes";
    detalhe.innerHTML = montarLinhaDetalhesConteudo(codigo);

    linhaProduto.insertAdjacentElement("afterend", detalhe);

    botao.textContent = "−";

}

function montarLinhaDetalhesConteudo(codigo){

    const locais = indiceLocaisPorProduto.get(Number(codigo)) || [];

    let htmlLocais = "";

    locais.forEach(item => {

        htmlLocais += `
            <div class="linha-local">
                <span>${item["Nome do Local de Estoque"]}</span>
                <strong>${formatarNumero(item["Qtd.fisica"])} ${item.UN}</strong>
            </div>
        `;

    });

    return `
        <td></td>
        <td colspan="3">
            <div class="box-detalhes">
                <h4>📍 Estoque por Local</h4>
                ${htmlLocais}
            </div>
        </td>
    `;

}

function obterDadosFiltradosAtuais(){

    const empresa = document.getElementById("filtroEmpresa")?.value || "";
    const localSelect = document.getElementById("filtroLocal")?.value || "";
    const localGrafico = window.localSelecionado || "";
    const local = localGrafico || localSelect;
    const familia = window.familiaSelecionada || "";

    return dadosProdutos.filter(item => {

        const okEmpresa = !empresa || item["Sig.emp"] === empresa;
        const okLocal = !local || item["Nome do Local de Estoque"] === local;
        const okFamilia = !familia || item.Familia === familia;

        return okEmpresa && okLocal && okFamilia;

    });

}