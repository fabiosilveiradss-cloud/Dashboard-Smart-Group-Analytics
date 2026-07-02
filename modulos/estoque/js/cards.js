//-----------------------------------------------------
// CARDS
//-----------------------------------------------------

function atualizarCards(dados){

    // Produtos
    document.getElementById("totalProdutos").textContent = dados.length;

    // Quantidade Total
    let quantidade = 0;

    dados.forEach(item=>{

        quantidade += Number(item["Qtd.fisica"]) || 0;

    });

    document.getElementById("quantidadeTotal").textContent =
        quantidade.toLocaleString("pt-BR",{
            minimumFractionDigits:0,
            maximumFractionDigits:0
        });

    // Empresas

    const empresas =
        [...new Set(dados.map(item=>item["Sig.emp"]))];

  document.getElementById("totalEmpresas").textContent =
    empresas.length;

const locais =
    [...new Set(dados.map(item=>item["Nome do Local de Estoque"]))];

document.getElementById("totalLocais").textContent =
    locais.length;

}