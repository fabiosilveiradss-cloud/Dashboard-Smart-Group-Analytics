function agruparProdutos(dados){

    const produtos = {};

    dados.forEach(item => {

        const codigo = String(item.Produto);

        if(!produtos[codigo]){

            produtos[codigo] = {
                ...item,
                "Qtd.fisica": Number(item["Qtd.fisica"]) || 0,
                "Vlr.tot.est": Number(item["Vlr.tot.est"]) || 0
            };

        }else{

            produtos[codigo]["Qtd.fisica"] = Number(
                (
                    produtos[codigo]["Qtd.fisica"] +
                    Number(item["Qtd.fisica"] || 0)
                ).toFixed(3)
            );

            produtos[codigo]["Vlr.tot.est"] +=
                Number(item["Vlr.tot.est"]) || 0;
        }

    });

    return Object.values(produtos);

}

window.agruparProdutos = agruparProdutos;