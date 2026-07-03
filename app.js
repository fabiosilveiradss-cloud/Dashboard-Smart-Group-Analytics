// ================================
// SMART GROUP ANALYTICS
// APP.JS
// ================================

function abrirModulo(modulo, elemento){

    // Remove o menu ativo
    document.querySelectorAll(".menu a").forEach(item=>{
        item.classList.remove("active");
    });

    elemento.classList.add("active");

    const titulo =
        document.getElementById("tituloPagina");

    const subtitulo =
        document.getElementById("subtituloPagina");

    const conteudo =
        document.getElementById("conteudo");

    switch(modulo){

        case "dashboard":

            titulo.innerText="Dashboard";

            subtitulo.innerText=
            "Visão geral do Smart Group Analytics";

            location.reload();

        break;

      case "estoque":

    titulo.innerText = "Estoque Comercial";

    subtitulo.innerText =
    "Controle inteligente dos estoques.";

    conteudo.innerHTML = `
        <iframe 
            src="modulos/estoque/index.html"
            class="iframe-modulo">
        </iframe>
    `;

break;

     case "vendas":

    titulo.innerText = "Dashboard Comercial";

    subtitulo.innerText =
    "Faturamento, clientes e produtos.";

    conteudo.innerHTML = `
        <iframe 
            src="modulos/vendas/index.html"
            class="iframe-modulo">
        </iframe>
    `;

break;

        case "usuarios":

            titulo.innerText="Usuários";

            subtitulo.innerText=
            "Gerenciamento de usuários.";

            conteudo.innerHTML=`
            
            <div class="loading-dashboard">

                <i class="fa-solid fa-users"></i>

                <h2>Cadastro de Usuários</h2>

            </div>

            `;

        break;

        case "permissoes":

            titulo.innerText="Permissões";

            subtitulo.innerText=
            "Perfis de acesso.";

            conteudo.innerHTML=`
            
            <div class="loading-dashboard">

                <i class="fa-solid fa-shield-halved"></i>

                <h2>Perfis e Permissões</h2>

            </div>

            `;

        break;

        case "logs":

            titulo.innerText="Logs";

            subtitulo.innerText=
            "Histórico do sistema.";

            conteudo.innerHTML=`
            
            <div class="loading-dashboard">

                <i class="fa-solid fa-file-lines"></i>

                <h2>Logs de acesso</h2>

            </div>

            `;

        break;

        case "configuracoes":

            titulo.innerText="Configurações";

            subtitulo.innerText=
            "Configurações gerais.";

            conteudo.innerHTML=`
            
            <div class="loading-dashboard">

                <i class="fa-solid fa-gear"></i>

                <h2>Configurações</h2>

            </div>

            `;

        break;

    }

}

function alternarTelaCheia(){

    document.body.classList.toggle("modo-fullscreen");

    const icone =
        document.getElementById("iconeFullscreen");

    if(!icone) return;

    if(document.body.classList.contains("modo-fullscreen")){

        icone.classList.remove("fa-expand");
        icone.classList.add("fa-xmark");

    } else {

        icone.classList.remove("fa-xmark");
        icone.classList.add("fa-expand");

    }

}

function voltarPortal(){

    document.getElementById("tituloPagina").innerText="Dashboard";

    document.getElementById("subtituloPagina").innerText=
    "Visão geral do Smart Group Analytics";

    document.getElementById("conteudo").innerHTML = `
        <div class="home">

            <div class="boas-vindas">
                <h2>Olá, Fabio! 👋</h2>
                <p>Bem-vindo ao Smart Group Analytics.</p>
            </div>

            <div class="cards-home">

                <div class="card-home">
                    <i class="fa-solid fa-cube"></i>
                    <h3>Estoque Comercial</h3>
                    <p>Acompanhe saldos, locais e famílias de materiais.</p>
                </div>

                <div class="card-home">
                    <i class="fa-solid fa-chart-line"></i>
                    <h3>Vendas</h3>
                    <p>Visualize faturamento, clientes e produtos vendidos.</p>
                </div>

                <div class="card-home">
                    <i class="fa-solid fa-shield-halved"></i>
                    <h3>Controle de Acesso</h3>
                    <p>Portal preparado para permissões por usuário.</p>
                </div>

            </div>

            <img class="marca-dagua" src="logo.png">
        </div>
    `;

    document.querySelectorAll(".menu a").forEach(a=>a.classList.remove("active"));
    document.querySelector(".menu a").classList.add("active");
}

document.querySelector(".menu-btn")?.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("aberto");
});
