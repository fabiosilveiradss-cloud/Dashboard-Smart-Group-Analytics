//-----------------------------------------------------
// PREENCHER FILTROS
//-----------------------------------------------------

function preencherFiltros(dados){

    const filtroEmpresa =
        document.getElementById("filtroEmpresa");

    const filtroLocal =
        document.getElementById("filtroLocal");

    // Empresas
    if (filtroEmpresa) {

        const empresaSelecionada =
            filtroEmpresa.value;

        const empresas =
            [...new Set(
                dados
                    .map(item => item["Sig.emp"])
                    .filter(Boolean)
            )].sort();

        filtroEmpresa.innerHTML =
            '<option value="">Todas Empresas</option>';

        empresas.forEach(emp => {

            filtroEmpresa.innerHTML +=
                `<option value="${emp}">${emp}</option>`;
        });

        filtroEmpresa.value =
            empresaSelecionada;
    }

    // Locais
    if (filtroLocal) {

        const localSelecionado =
            filtroLocal.value;

        const locais =
            [...new Set(
                dados
                    .map(item => item["Nome do Local de Estoque"])
                    .filter(Boolean)
            )].sort();

        filtroLocal.innerHTML =
            '<option value="">Todos Locais</option>';

        locais.forEach(local => {

            filtroLocal.innerHTML +=
                `<option value="${local}">${local}</option>`;
        });

        filtroLocal.value =
            localSelecionado;
    }
}
