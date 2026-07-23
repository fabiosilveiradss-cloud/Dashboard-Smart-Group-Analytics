// =====================================================
// SMART GROUP ANALYTICS
// MENU DO USUÁRIO
// =====================================================

import { auth } from "./firebase-config.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


// =====================================================
// ELEMENTOS DO MENU
// =====================================================

const btnUsuario =
    document.getElementById("btnUsuario");

const menuUsuario =
    document.getElementById("menuUsuario");

const btnLogout =
    document.getElementById("btnLogout");


// Elementos do usuário no topo
const avatarUsuario =
    document.getElementById("avatarUsuario");

const nomeUsuarioTopo =
    document.getElementById("nomeUsuarioTopo");

const perfilUsuarioTopo =
    document.getElementById("perfilUsuarioTopo");


// Elementos dentro do menu
const avatarUsuarioMenu =
    document.getElementById("avatarUsuarioMenu");

const nomeUsuarioMenu =
    document.getElementById("nomeUsuarioMenu");

const perfilUsuarioMenu =
    document.getElementById("perfilUsuarioMenu");


// =====================================================
// SINCRONIZAR DADOS DO USUÁRIO
// =====================================================

function sincronizarDadosUsuario() {

    if (
        avatarUsuario &&
        avatarUsuarioMenu
    ) {
        avatarUsuarioMenu.textContent =
            avatarUsuario.textContent.trim() || "U";
    }

    if (
        nomeUsuarioTopo &&
        nomeUsuarioMenu
    ) {
        nomeUsuarioMenu.textContent =
            nomeUsuarioTopo.textContent.trim() || "Usuário";
    }

    if (
        perfilUsuarioTopo &&
        perfilUsuarioMenu
    ) {
        perfilUsuarioMenu.textContent =
            perfilUsuarioTopo.textContent.trim() || "Usuário";
    }
}


// =====================================================
// ABRIR MENU
// =====================================================

function abrirMenuUsuario() {

    sincronizarDadosUsuario();

    menuUsuario?.classList.add("aberto");
    btnUsuario?.classList.add("aberto");

    btnUsuario?.setAttribute(
        "aria-expanded",
        "true"
    );
}


// =====================================================
// FECHAR MENU
// =====================================================

function fecharMenuUsuario() {

    menuUsuario?.classList.remove("aberto");
    btnUsuario?.classList.remove("aberto");

    btnUsuario?.setAttribute(
        "aria-expanded",
        "false"
    );
}


// =====================================================
// ALTERNAR MENU
// =====================================================

function alternarMenuUsuario() {

    if (!menuUsuario) return;

    const estaAberto =
        menuUsuario.classList.contains("aberto");

    if (estaAberto) {
        fecharMenuUsuario();
    } else {
        abrirMenuUsuario();
    }
}


// =====================================================
// CLIQUE NO BOTÃO DO USUÁRIO
// =====================================================

btnUsuario?.addEventListener(
    "click",
    function (evento) {

        evento.stopPropagation();

        alternarMenuUsuario();
    }
);


// Impede que o clique dentro do menu feche imediatamente
menuUsuario?.addEventListener(
    "click",
    function (evento) {
        evento.stopPropagation();
    }
);


// =====================================================
// FECHAR AO CLICAR FORA
// =====================================================

document.addEventListener(
    "click",
    function () {
        fecharMenuUsuario();
    }
);


// =====================================================
// FECHAR COM A TECLA ESC
// =====================================================

document.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Escape") {

            fecharMenuUsuario();

            btnUsuario?.focus();
        }
    }
);


// =====================================================
// OBSERVAR ALTERAÇÕES FEITAS PELO AUTH-GUARD
// =====================================================

const observadorUsuario =
    new MutationObserver(function () {

        sincronizarDadosUsuario();
    });


[
    avatarUsuario,
    nomeUsuarioTopo,
    perfilUsuarioTopo
].forEach(function (elemento) {

    if (!elemento) return;

    observadorUsuario.observe(
        elemento,
        {
            childList: true,
            characterData: true,
            subtree: true
        }
    );
});


// Sincronização inicial
sincronizarDadosUsuario();


// =====================================================
// LOGOUT
// =====================================================

btnLogout?.addEventListener(
    "click",
    async function () {

        const textoOriginal =
            btnLogout.innerHTML;

        try {

            // Bloqueia cliques repetidos
            btnLogout.disabled = true;

            btnLogout.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Saindo...
            `;

            // Encerra a sessão no Firebase
            await signOut(auth);

            // Limpa possíveis informações temporárias
            sessionStorage.clear();

            // Redireciona para o login
            window.location.replace("./login.html");

        } catch (erro) {

            console.error(
                "Erro ao sair do sistema:",
                erro
            );

            btnLogout.disabled = false;
            btnLogout.innerHTML = textoOriginal;

            alert(
                "Não foi possível encerrar a sessão. Tente novamente."
            );
        }
    }
);
