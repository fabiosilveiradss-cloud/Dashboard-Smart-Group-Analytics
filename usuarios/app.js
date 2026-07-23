import { auth, db } from "../../firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const tabela = document.getElementById("tabelaUsuarios");
const tabelaContainer = document.getElementById("tabelaContainer");
const mensagem = document.getElementById("mensagem");
const estadoVazio = document.getElementById("estadoVazio");
const pesquisa = document.getElementById("pesquisaUsuario");

const totalUsuarios = document.getElementById("totalUsuarios");
const usuariosAtivos = document.getElementById("usuariosAtivos");
const totalAdministradores = document.getElementById("totalAdministradores");

const btnAtualizar = document.getElementById("btnAtualizar");
const btnNovoUsuario = document.getElementById("btnNovoUsuario");
const toast = document.getElementById("toast");

let usuarios = [];

onAuthStateChanged(auth, async usuario => {
  if (!usuario) {
    window.top.location.replace("../../login.html");
    return;
  }

  await carregarUsuarios();
  document.body.classList.remove("carregando");
});

async function carregarUsuarios() {
  mostrarCarregando();

  try {
    const referencia = collection(db, "usuarios");
    const resultado = await getDocs(referencia);

    usuarios = resultado.docs.map(documento => ({
      id: documento.id,
      ...documento.data()
    }));

    usuarios.sort((a, b) =>
      String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR")
    );

    atualizarResumo();
    renderizarUsuarios(usuarios);

  } catch (erro) {
    console.error("Erro ao carregar usuários:", erro);

    mensagem.hidden = false;
    mensagem.textContent =
      "Não foi possível carregar os usuários. Verifique as permissões do Firestore.";

    tabelaContainer.hidden = true;
    estadoVazio.hidden = true;

    mostrarToast("Erro ao consultar os usuários.", true);
  }
}

function renderizarUsuarios(lista) {
  mensagem.hidden = true;

  if (!lista.length) {
    tabela.innerHTML = "";
    tabelaContainer.hidden = true;
    estadoVazio.hidden = false;
    return;
  }

  estadoVazio.hidden = true;
  tabelaContainer.hidden = false;

  tabela.innerHTML = lista.map(usuario => {
    const nome = escaparHtml(usuario.nome || "Usuário sem nome");
    const email = escaparHtml(usuario.email || "E-mail não informado");
    const cargo = escaparHtml(usuario.cargo || "Cargo não informado");
    const setor = escaparHtml(usuario.setor || "Setor não informado");
    const perfil = escaparHtml(formatarPerfil(usuario.perfil));
    const empresa = escaparHtml(usuario.empresa || "Não informada");
    const ativo = usuario.ativo === true;
    const iniciais = obterIniciais(usuario.nome);

    return `
      <tr>
        <td>
          <div class="usuario-cell">
            <div class="avatar">${iniciais}</div>
            <div>
              <strong>${nome}</strong>
              <span>${email}</span>
            </div>
          </div>
        </td>

        <td>
          ${cargo}
          <span class="texto-secundario">${setor}</span>
        </td>

        <td>
          <span class="badge perfil">
            <i class="fa-solid fa-shield-halved"></i>
            ${perfil}
          </span>
        </td>

        <td>${empresa}</td>

        <td>
          <span class="badge ${ativo ? "ativo" : "inativo"}">
            <i class="fa-solid fa-circle"></i>
            ${ativo ? "Ativo" : "Inativo"}
          </span>
        </td>

        <td>
          <div class="acoes">
            <button class="btn-acao" type="button"
                    title="Editar usuário"
                    data-acao="editar"
                    data-id="${usuario.id}">
              <i class="fa-solid fa-pen"></i>
            </button>

            <button class="btn-acao" type="button"
                    title="Ver permissões"
                    data-acao="permissoes"
                    data-id="${usuario.id}">
              <i class="fa-solid fa-key"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function atualizarResumo() {
  totalUsuarios.textContent = usuarios.length;
  usuariosAtivos.textContent =
    usuarios.filter(usuario => usuario.ativo === true).length;

  totalAdministradores.textContent =
    usuarios.filter(usuario =>
      String(usuario.perfil || "").toLowerCase() === "administrador"
    ).length;
}

pesquisa.addEventListener("input", () => {
  const termo = pesquisa.value.toLowerCase().trim();

  if (!termo) {
    renderizarUsuarios(usuarios);
    return;
  }

  const filtrados = usuarios.filter(usuario => {
    const texto = [
      usuario.nome,
      usuario.email,
      usuario.cargo,
      usuario.setor,
      usuario.perfil,
      usuario.empresa
    ].join(" ").toLowerCase();

    return texto.includes(termo);
  });

  renderizarUsuarios(filtrados);
});

btnAtualizar.addEventListener("click", carregarUsuarios);

btnNovoUsuario.addEventListener("click", () => {
  mostrarToast(
    "A listagem está pronta. O cadastro será habilitado na próxima etapa."
  );
});

tabela.addEventListener("click", evento => {
  const botao = evento.target.closest("[data-acao]");

  if (!botao) {
    return;
  }

  const usuario = usuarios.find(item => item.id === botao.dataset.id);

  if (!usuario) {
    return;
  }

  if (botao.dataset.acao === "editar") {
    mostrarToast(
      `Edição de ${usuario.nome} será habilitada na próxima etapa.`
    );
  }

  if (botao.dataset.acao === "permissoes") {
    mostrarToast(
      `Permissões de ${usuario.nome} serão habilitadas na próxima etapa.`
    );
  }
});

function mostrarCarregando() {
  mensagem.hidden = false;
  mensagem.textContent = "Carregando usuários...";
  tabelaContainer.hidden = true;
  estadoVazio.hidden = true;
}

function formatarPerfil(perfil) {
  const valor = String(perfil || "usuário");
  return valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
}

function obterIniciais(nome) {
  const partes = String(nome || "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return partes
    .slice(0, 2)
    .map(parte => parte.charAt(0).toUpperCase())
    .join("");
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function mostrarToast(texto, erro = false) {
  toast.textContent = texto;
  toast.classList.toggle("erro", erro);
  toast.classList.add("visivel");

  window.clearTimeout(mostrarToast.tempo);

  mostrarToast.tempo = window.setTimeout(() => {
    toast.classList.remove("visivel");
  }, 3500);
}
