window.familiaSelecionada = null;

function obterFamilia(descricao){

    if(!descricao) return "SEM FAMÍLIA";

    const texto = String(descricao)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, " ");

    return texto.split(" ")[0] || "SEM FAMÍLIA";

}

function atualizarGraficoFamilia(dados){

    const resumo = {};

    dados.forEach(item => {

        const familia = item.Familia;
        const qtd = Number(item["Qtd.fisica"]) || 0;

        resumo[familia] = (resumo[familia] || 0) + qtd;

    });

    const familias = Object.entries(resumo)
        .sort((a,b) => b[1] - a[1]);

    const maiorValor = familias[0] ? familias[0][1] : 1;

    const container = document.getElementById("rankingFamilias");

    container.innerHTML = "";

    familias.forEach(([familia, valor]) => {

        const percentual = (valor / maiorValor) * 100;

        container.innerHTML += `
            <div class="familia-item" onclick="filtrarPorFamilia('${familia}')">

                <div class="familia-topo">
                    <span>${familia}</span>
                    <strong>${formatarNumero(valor)} m</strong>
                </div>

                <div class="familia-barra-fundo">
                    <div class="familia-barra" style="width:${percentual}%"></div>
                </div>

            </div>
        `;

    });

}

function filtrarPorFamilia(familia){

    window.familiaSelecionada = familia;

    aplicarFiltrosTabela();

    const tag = document.getElementById("familiaSelecionada");

    if(tag){
        tag.style.display = "inline-block";
        tag.textContent = familia;
    }

}

document.getElementById("limparFamilia").addEventListener("click", function(){

    window.familiaSelecionada = null;
    window.localSelecionado = null;

    const pesquisa = document.getElementById("pesquisaProduto");

    if(pesquisa){
        pesquisa.value = "";
    }

    const filtroLocal = document.getElementById("filtroLocal");
    const filtroEmpresa = document.getElementById("filtroEmpresa");

    if(filtroLocal){
        filtroLocal.value = "";
    }

    if(filtroEmpresa){
        filtroEmpresa.value = "";
    }

    const tag = document.getElementById("familiaSelecionada");

    if(tag){
    tag.textContent = "";
    tag.style.display = "none";
    }

    aplicarFiltrosTabela();
  
});

const dadosAtuais = obterDadosFiltradosAtuais();

const dadosAgrupadosAtuais = agruparProdutos(dadosAtuais);

atualizarCards(dadosAgrupadosAtuais);

atualizarGraficoFamilia(dadosAgrupadosAtuais);
