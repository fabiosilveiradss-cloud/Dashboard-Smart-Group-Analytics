// ============================================
// SMART GROUP ANALYTICS
// INICIALIZADOR SEGURO DOS MÓDULOS
// ============================================

import {
  protegerModulo
} from "./module-guard.js?v=2";


// ============================================
// INICIAR MÓDULO
// ============================================

export async function iniciarModulo(configuracao = {}) {

  const modulo =
    String(configuracao.modulo || "")
      .trim()
      .toLowerCase();

  const scripts =
    Array.isArray(configuracao.scripts)
      ? configuracao.scripts
      : [];

  if (!modulo) {

    console.error(
      "Bootstrap: o nome do módulo não foi informado."
    );

    mostrarErro(
      "Não foi possível identificar este módulo."
    );

    return;
  }

  try {

    // Primeiro valida login, usuário ativo
    // e permissão no Firestore.
    await protegerModulo(modulo);

    // Somente depois da autorização,
    // carrega os arquivos JavaScript do módulo.
    for (const caminhoScript of scripts) {

      await carregarScript(caminhoScript);

    }

    document.body.classList.remove("carregando");

    console.log(
      `Módulo "${modulo}" iniciado com sucesso.`
    );

  } catch (erro) {

    console.warn(
      `Inicialização do módulo "${modulo}" interrompida:`,
      erro
    );

  }

}


// ============================================
// CARREGAR SCRIPT EM ORDEM
// ============================================

function carregarScript(caminho) {

  return new Promise((resolve, reject) => {

    const caminhoLimpo =
      String(caminho || "").trim();

    if (!caminhoLimpo) {

      resolve();

      return;
    }

    const scriptExistente =
      document.querySelector(
        `script[data-bootstrap-src="${CSS.escape(caminhoLimpo)}"]`
      );

    if (scriptExistente) {

      resolve();

      return;
    }

    const script =
      document.createElement("script");

    script.src = caminhoLimpo;
    script.async = false;
    script.dataset.bootstrapSrc = caminhoLimpo;

    script.onload = () => {

      console.log(
        `Script carregado: ${caminhoLimpo}`
      );

      resolve();

    };

    script.onerror = () => {

      const erro = new Error(
        `Não foi possível carregar o arquivo: ${caminhoLimpo}`
      );

      console.error(erro);

      mostrarErro(
        "Não foi possível carregar todos os recursos deste módulo."
      );

      reject(erro);

    };

    document.body.appendChild(script);

  });

}


// ============================================
// EXIBIR ERRO DE INICIALIZAÇÃO
// ============================================

function mostrarErro(mensagem) {

  document.documentElement.style.visibility =
    "visible";

  document.body.innerHTML = `
    <main style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px;
      background: #031126;
      font-family: Arial, sans-serif;
      color: white;
      text-align: center;
    ">

      <section style="
        width: 100%;
        max-width: 480px;
        padding: 35px;
        border-radius: 18px;
        background: #0c2858;
        border: 1px solid #24518f;
        box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
      ">

        <div style="
          font-size: 45px;
          margin-bottom: 15px;
        ">
          ⚠️
        </div>

        <h1 style="
          margin: 0 0 12px;
          font-size: 25px;
        ">
          Erro ao carregar o módulo
        </h1>

        <p style="
          margin: 0;
          color: #c7d7f3;
          line-height: 1.6;
        ">
          ${escaparHtml(mensagem)}
        </p>

        <button
          type="button"
          onclick="window.location.href='./'"
          style="
            margin-top: 25px;
            padding: 12px 22px;
            border: none;
            border-radius: 9px;
            background: #1681ff;
            color: white;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
          "
        >
          Voltar
        </button>

      </section>

    </main>
  `;

}


// ============================================
// PROTEGER TEXTO INSERIDO NO HTML
// ============================================

function escaparHtml(valor) {

  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
