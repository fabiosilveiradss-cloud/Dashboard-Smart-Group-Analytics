let dadosProdutos = [];
let dadosFiltrados = [];
let indiceLocaisPorProduto = new Map();

console.log("APP INICIOU");
// alert("APP INICIOU");  // pode comentar ou apagar depois

let detalheAberto = null;

function toggleDetalhes(id, botao){

    const detalhe = document.getElementById(id);

    if(detalheAberto && detalheAberto !== detalhe){

        detalheAberto.style.display = "none";

        document.querySelectorAll('.btn-expandir').forEach(btn=>{
            btn.innerHTML = "+";
        });
    }

    if(detalhe.style.display === "table-row"){

        detalhe.style.display = "none";
        botao.innerHTML = "+";
        detalheAberto = null;

    }else{

        detalhe.style.display = "table-row";
        botao.innerHTML = "−";
        detalheAberto = detalhe;
    }
}

document.addEventListener('click', function(e){

    if(
        !e.target.closest('.linha-produto') &&
        !e.target.closest('.detalhes') &&
        !e.target.closest('.btn-expandir')
    ){

        document.querySelectorAll('.detalhes').forEach(item=>{
            item.style.display = "none";
        });

        document.querySelectorAll('.btn-expandir').forEach(btn=>{
            btn.innerHTML = "+";
        });

        detalheAberto = null;
    }

});

function preencherFiltros(dados){

    const empresas =
    [...new Set(dados.map(item => item["Sig.emp"]))].sort();

   const locais =
    [...new Set(dados.map(item => item["Nome do Local de Estoque"]))].sort();

    const filtroEmpresa =
        document.getElementById("filtroEmpresa");

    const filtroLocal =
        document.getElementById("filtroLocal");

    filtroEmpresa.innerHTML =
        '<option value="">Todas Empresas</option>';

    empresas.forEach(emp=>{

        filtroEmpresa.innerHTML +=
        `<option value="${emp}">${emp}</option>`;

    });

    filtroLocal.innerHTML =
        '<option value="">Todos Locais</option>';

    locais.forEach(local=>{

        filtroLocal.innerHTML +=
        `<option value="${local}">${local}</option>`;

    });

}

document.getElementById("arquivoExcel").addEventListener("change", function(event){

    const arquivo = event.target.files[0];

    if(!arquivo){
        alert("Nenhum arquivo selecionado");
        return;
    }

    console.log("Arquivo selecionado:", arquivo.name);

    const reader = new FileReader();

    reader.onload = function(e){
        console.log("ENTROU NO READER");
        const data = new Uint8Array(e.target.result);

        const workbook = XLSX.read(data, {
            type: "array"
        });

        console.log("Planilhas:", workbook.SheetNames);

        const worksheet =
            workbook.Sheets[workbook.SheetNames[0]];

     const json = XLSX.utils.sheet_to_json(worksheet);

     json.forEach(item => {
    item.Familia = obterFamilia(item["Desc.completa"]);
});

dadosProdutos = json;

indiceLocaisPorProduto = criarIndiceLocais(dadosProdutos);

dadosFiltrados = [...json];

const produtosAgrupados = agruparProdutos(dadosProdutos);

dadosFiltrados = produtosAgrupados;

carregarDashboard(produtosAgrupados);

    };

    reader.readAsArrayBuffer(arquivo);

});

console.log(document.getElementById("pesquisaProduto"));
document.getElementById("pesquisaProduto").addEventListener("input", function() {
  
console.log("DIGITOU:", this.value);

  
aplicarFiltrosTabela();

});

document.getElementById("filtroEmpresa").addEventListener("change", function(){

    aplicarFiltrosTabela();

});

document.getElementById("filtroLocal").addEventListener("change", function(){

    aplicarFiltrosTabela();

});

//-----------------------------------------------------
// CENTRAL DO DASHBOARD
//-----------------------------------------------------

function carregarDashboard(dados){

    console.log("CHEGOU NA CENTRAL");

    dadosFiltrados = dados;

    preencherFiltros(dados);

    atualizarCards(dados);

    atualizarGraficoLocal(dados);

    atualizarGraficoFamilia(dados);

    atualizarTabela(dados);

}

console.log("APP.JS CARREGOU");

function criarIndiceLocais(dados){

    const indice = new Map();

    dados.forEach(item => {

        const codigo = Number(item.Produto);

        if(!indice.has(codigo)){
            indice.set(codigo, []);
        }

        indice.get(codigo).push(item);

    });

    return indice;

}