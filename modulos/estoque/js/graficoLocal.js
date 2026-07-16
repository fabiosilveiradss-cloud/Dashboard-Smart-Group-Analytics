//-----------------------------------------------------
// LOCALIZAR DESCRIÇÃO DO PRODUTO
//-----------------------------------------------------

function obterDescricaoProduto(item) {

    if (!item || typeof item !== "object") {
        return "Produto sem descrição";
    }

    // Nomes comuns que podem existir na planilha
    const nomesPossiveis = [
        "Descrição do Produto",
        "Descricao do Produto",
        "Descrição Produto",
        "Descricao Produto",
        "Descrição",
        "Descricao",
        "Desc. Produto",
        "Desc Produto",
        "Desc.produto",
        "Desc.prod.",
        "Descrição do Item",
        "Descricao do Item",
        "Nome do Produto",
        "Nome Produto",
        "Denominação",
        "Denominacao",
        "Material",
        "Descrição Material",
        "Descricao Material",
        "Descrição do Material",
        "Descricao do Material"
    ];

    // Primeiro tenta localizar pelo nome exato
    for (const nome of nomesPossiveis) {

        const valor = item[nome];

        if (
            valor !== undefined &&
            valor !== null &&
            String(valor).trim() !== ""
        ) {
            return String(valor).trim();
        }
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
