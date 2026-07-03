/*=========================================
 SMART GROUP ANALYTICS
 Dashboard de Vendas
=========================================*/

const CONFIG = {

    API_URL:
    "https://script.google.com/macros/s/AKfycbwhRhN4FMhCLy4abvrZ4JjAu6JkQFurf_CY5eyyoB010FWGkHIl3Jc15NNudk6aRoOz/exec",

    CACHE_KEY:
    "dashboard_vendas_cache",

    CACHE_TIME:
    20 * 60 * 1000

};

/*=========================================
 Variáveis Globais
=========================================*/

let dados = [];

let filtrados = [];

let clientesSelecionados = [];

let representantesSelecionados = [];

let produtoSelecionado = "";

let produtoDetalheHTML = "";

let paginaProdutos = 1;

const PRODUTOS_POR_PAGINA = 100;


/*=========================================
 Inicialização
=========================================*/

window.addEventListener("load", iniciarDashboard);

async function iniciarDashboard(){

    console.log("Smart Analytics iniciado");

}
