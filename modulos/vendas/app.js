/*=========================================
 SMART GROUP ANALYTICS
 Dashboard de Vendas
=========================================*/

    API_URL:
    "https://script.google.com/macros/s/AKfycbwhRhN4FMhCLy4abvrZ4JjAu6JkQFurf_CY5eyyoB010FWGkHIl3Jc15NNudk6aRoOz/exec",

    CACHE_KEY:
    "dashboard_vendas_cache",

    CACHE_TIME:
    20 * 60 * 1000
};

let dados = [];
let filtrados = [];
let clientesSelecionados = [];
let representantesSelecionados = [];
let produtoSelecionado = "";
let produtoDetalheHTML = "";
let paginaProdutos = 1;

const PRODUTOS_POR_PAGINA = 100;

window.addEventListener("load", iniciarDashboard);

async function iniciarDashboard(){

    atualizarStatus("Carregando dados...");

    const cache = localStorage.getItem(CONFIG.CACHE_KEY);

    if(cache){

        try{

            dados = JSON.parse(cache);

            console.log("Dados carregados do cache:", dados.length);

            popularUF();
            popularClientesMulti();
            popularRepresentantesMulti();
            popularAnos();
            aplicarFiltros();

            atualizarStatus("Dados carregados do cache. Atualizando em segundo plano...");

        }catch(e){

            console.warn("Cache inválido", e);

        }

    }

    await carregarDadosServidor();

}

async function carregarDadosServidor(){

    try{

        const resposta = await fetch(
            CONFIG.API_URL + "?t=" + Date.now()
        );

        dados = await resposta.json();

        localStorage.setItem(
            CONFIG.CACHE_KEY,
            JSON.stringify(dados)
        );

        console.log("Dados atualizados do servidor:", dados.length);

        popularUF();
        popularClientesMulti();
        popularRepresentantesMulti();
        popularAnos();
        aplicarFiltros();

        atualizarStatus("Dados atualizados com sucesso.");

        setTimeout(()=>{
            atualizarStatus("");
        },3000);

    }catch(e){

        console.error("Erro ao carregar dados:", e);

        atualizarStatus("Erro ao carregar dados. Verifique o Apps Script.");

    }

}

function atualizarStatus(texto){

    const el = document.getElementById("statusCarregamento");

    if(!el) return;

    el.innerText = texto;

    el.style.display = texto ? "block" : "none";

}
