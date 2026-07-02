function formatarNumero(valor){

    return Number(valor).toLocaleString("pt-BR",{
        minimumFractionDigits:0,
        maximumFractionDigits:3
    });

}

function formatarMoeda(valor){

    return Number(valor).toLocaleString("pt-BR",{
        style:"currency",
        currency:"BRL"
    });

}