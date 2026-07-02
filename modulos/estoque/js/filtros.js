//-----------------------------------------------------
// PREENCHER FILTROS
//-----------------------------------------------------

function preencherFiltros(dados){

    const filtroEmpresa =
        document.getElementById("filtroEmpresa");

    const filtroLocal =
        document.getElementById("filtroLocal");

    // Empresas

    const empresas =
        [...new Set(dados.map(item => item["Sig.emp"]))].sort();

    filtroEmpresa.innerHTML =
        '<option value="">Todas Empresas</option>';

    empresas.forEach(emp=>{

        filtroEmpresa.innerHTML +=
            `<option value="${emp}">${emp}</option>`;

    });

    // Locais

    const locais =
        [...new Set(dados.map(item => item["Nome do Local de Estoque"]))].sort();

    filtroLocal.innerHTML =
        '<option value="">Todos Locais</option>';

    locais.forEach(local=>{

        filtroLocal.innerHTML +=
            `<option value="${local}">${local}</option>`;

    });

}