window.MODULOS_ANALYTICS = [
  { id:"dashboard", nome:"Dashboard", nomeMenu:"Dashboard", descricao:"Visão geral do Smart Group Analytics", titulo:"Dashboard", subtitulo:"Visão geral do Smart Group Analytics", icone:"fa-solid fa-house", grupo:"principal", permissao:"dashboard", tipo:"dashboard", url:null, pesquisavel:true, concederPorPadrao:true },
  { id:"estoque", nome:"Estoque Comercial", nomeMenu:"Estoque Comercial", descricao:"Saldos, produtos, locais e famílias", titulo:"Estoque Comercial", subtitulo:"Controle inteligente dos estoques.", icone:"fa-solid fa-cube", grupo:"principal", permissao:"estoque", tipo:"iframe", url:"modulos/estoque/index.html?v=8", pesquisavel:true },
  { id:"vendas", nome:"Vendas", nomeMenu:"Vendas", descricao:"Faturamento, clientes e produtos vendidos", titulo:"Dashboard Comercial", subtitulo:"Faturamento, clientes e produtos.", icone:"fa-solid fa-chart-line", grupo:"principal", permissao:"vendas", tipo:"iframe", url:"modulos/vendas/index.html", pesquisavel:true },
  { id:"financeiro", nome:"Financeiro", nomeMenu:"Financeiro", descricao:"Gestão financeira, recebimentos e fluxo de caixa", titulo:"Financeiro", subtitulo:"Gestão financeira, recebimentos e fluxo de caixa.", icone:"fa-solid fa-wallet", grupo:"principal", permissao:"financeiro", tipo:"iframe", url:"modulos/financeiro/index.html?v=3", pesquisavel:true },
  { id:"usuarios", nome:"Usuários", nomeMenu:"Usuários", descricao:"Gerenciamento de usuários", titulo:"Usuários", subtitulo:"Gerenciamento de usuários.", icone:"fa-solid fa-user", grupo:"administracao", permissao:"usuarios", tipo:"iframe", url:"usuarios/index.html?v=4", pesquisavel:true },
  { id:"permissoes", nome:"Perfis e Permissões", nomeMenu:"Perfis e Permissões", descricao:"Perfis e regras de acesso", titulo:"Permissões", subtitulo:"Perfis de acesso.", icone:"fa-solid fa-shield-halved", grupo:"administracao", permissao:"usuarios", tipo:"aviso", mensagem:"Perfis e Permissões", pesquisavel:false, exibirNaPermissao:false },
  { id:"logs", nome:"Logs de Acesso", nomeMenu:"Logs de Acesso", descricao:"Histórico do sistema", titulo:"Logs", subtitulo:"Histórico do sistema.", icone:"fa-solid fa-file-lines", grupo:"administracao", permissao:"usuarios", tipo:"aviso", mensagem:"Logs de acesso", pesquisavel:false, exibirNaPermissao:false },
  { id:"configuracoes", nome:"Configurações", nomeMenu:"Configurações", descricao:"Configurações gerais", titulo:"Configurações", subtitulo:"Configurações gerais.", icone:"fa-solid fa-gear", grupo:"administracao", permissao:"configuracoes", tipo:"aviso", mensagem:"Configurações", pesquisavel:true },
  { id:"minha-conta", nome:"Minha Conta", nomeMenu:"Minha Conta", descricao:"Dados do usuário", titulo:"Minha Conta", subtitulo:"Dados e informações do usuário conectado.", icone:"fa-solid fa-circle-user", grupo:"interno", permissao:null, tipo:"iframe", url:"minha-conta/index.html?v=1", pesquisavel:false, exibirNoMenu:false, exibirNaPermissao:false }
];

window.obterModuloAnalytics = id =>
  window.MODULOS_ANALYTICS.find(m => m.id === id) || null;

window.modulosPermissaoAnalytics = () => {
  const mapa = new Map();
  window.MODULOS_ANALYTICS.forEach(m => {
    if (m.exibirNaPermissao === false || !m.permissao) return;
    if (!mapa.has(m.permissao)) {
      mapa.set(m.permissao, {
        id: m.permissao,
        nome: m.nome,
        icone: m.icone,
        concederPorPadrao: m.concederPorPadrao === true
      });
    }
  });
  return [...mapa.values()];
};
