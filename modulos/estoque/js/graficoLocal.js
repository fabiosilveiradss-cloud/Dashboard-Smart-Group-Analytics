//-----------------------------------------------------
// LOCALIZAR DESCRIÇÃO DO PRODUTO
//-----------------------------------------------------

//-----------------------------------------------------
// OBTER DESCRIÇÃO DO PRODUTO
//-----------------------------------------------------

function obterDescricaoProduto(item) {

    const descricao = item["Desc.completa"];

    if (
        descricao !== undefined &&
        descricao !== null &&
        String(descricao).trim() !== ""
    ) {
        return String(descricao).trim();
    }

    return "Produto sem descrição";
}

    //-------------------------------------------------
    // NORMALIZAR O NOME DAS COLUNAS
    //-------------------------------------------------

    function normalizar(texto) {

        return String(texto)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

    }

    const chaves = Object.keys(item);

    //-------------------------------------------------
    // PROCURA AUTOMATICAMENTE POR DESCRIÇÃO
    //-------------------------------------------------

    const palavrasDescricao = [
        "descricao",
        "descr",
        "descproduto",
        "descitem",
        "descmaterial",
        "denominacao",
        "nomeproduto",
        "nomematerial"
    ];

    const chaveEncontrada = chaves.find(chave => {

        const chaveNormalizada = normalizar(chave);

        return palavrasDescricao.some(palavra =>
            chaveNormalizada.includes(palavra)
        );

    });

    if (chaveEncontrada) {

        const valor = item[chaveEncontrada];

        if (
            valor !== undefined &&
            valor !== null &&
            String(valor).trim() !== ""
        ) {
            return String(valor).trim();
        }
    }

    //-------------------------------------------------
    // ÚLTIMA TENTATIVA:
    // LOCALIZA O TEXTO MAIS LONGO DA LINHA
    //-------------------------------------------------

    const colunasIgnoradas = [
        "produto",
        "qtdfisica",
        "vlrtotest",
        "sigemp",
        "nomedolocaldeestoque",
        "familia",
        "codigofamilia",
        "empresa",
        "local"
    ];

    const candidatos = chaves
        .filter(chave => {

            const chaveNormalizada = normalizar(chave);

            return !colunasIgnoradas.some(ignorada =>
                chaveNormalizada === ignorada
            );

        })
        .map(chave => ({
            chave: chave,
            valor: item[chave]
        }))
        .filter(candidato => {

            const valor = candidato.valor;

            if (valor === undefined || valor === null) {
                return false;
            }

            const texto = String(valor).trim();

            return (
                texto.length >= 4 &&
                isNaN(Number(texto))
            );

        })
        .sort((a, b) =>
            String(b.valor).length - String(a.valor).length
        );

    if (candidatos.length > 0) {
        return String(candidatos[0].valor).trim();
    }

    return "Produto sem descrição";
}
