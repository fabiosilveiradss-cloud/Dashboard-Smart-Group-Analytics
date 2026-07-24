// =====================================================
// SMART GROUP ANALYTICS
// MENU DO USUÁRIO
// =====================================================


// =====================================================
// IMPORTAÇÕES
// =====================================================

import { auth } from "./firebase-config.js";

import {
    signOut,
    sendPasswordResetEmail
} from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


// =====================================================
// CONFIGURAÇÃO DO FIREBASE
// =====================================================

auth.languageCode =
    "pt-BR";


// =====================================================
// ELEMENTOS DO MENU
// =====================================================

const btnUsuario =
    document.getElementById("btnUsuario");

const menuUsuario =
    document.getElementById("menuUsuario");

const btnLogout =
    document.getElementById("btnLogout");

const btnMinhaConta =
    document.getElementById("btnMinhaConta");

const btnAlterarSenha =
    document.getElementById("btnAlterarSenha");


// =====================================================
// ELEMENTOS DO USUÁRIO NO TOPO
// =====================================================

const avatarUsuario =
    document.getElementById("avatarUsuario");

const nomeUsuarioTopo =
    document.getElementById("nomeUsuarioTopo");

const perfilUsuarioTopo =
    document.getElementById("perfilUsuarioTopo");


// =====================================================
// ELEMENTOS DENTRO DO MENU
// =====================================================

const avatarUsuarioMenu =
    document.getElementById("avatarUsuarioMenu");

const nomeUsuarioMenu =
    document.getElementById("nomeUsuarioMenu");

const perfilUsuarioMenu =
    document.getElementById("perfilUsuarioMenu");


// =====================================================
// CRIAR MODAL DE ALTERAÇÃO DE SENHA
// =====================================================

function criarModalAlterarSenha() {

    if (
        document.getElementById(
            "modalAlterarSenhaUsuario"
        )
    ) {
        return;
    }

    const estilo =
        document.createElement("style");

    estilo.id =
        "estiloModalAlterarSenha";

    estilo.textContent = `

        body.modal-senha-aberto {
            overflow: hidden;
        }

        .modal-senha-overlay {
            position: fixed;
            z-index: 999999;

            inset: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 20px;

            background: rgba(2, 15, 37, 0.74);
            backdrop-filter: blur(6px);

            opacity: 0;
            visibility: hidden;
            pointer-events: none;

            transition:
                opacity 0.25s ease,
                visibility 0.25s ease;
        }

        .modal-senha-overlay.aberto {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        }

        .modal-senha-card {
            position: relative;

            width: min(440px, 100%);

            padding: 36px;

            border:
                1px solid
                rgba(177, 198, 226, 0.45);

            border-radius: 18px;

            background: #ffffff;
            color: #07162f;

            box-shadow:
                0 30px 90px
                rgba(0, 0, 0, 0.35);

            transform:
                translateY(-18px)
                scale(0.97);

            transition:
                transform 0.25s ease;
        }

        .modal-senha-overlay.aberto
        .modal-senha-card {
            transform:
                translateY(0)
                scale(1);
        }

        .modal-senha-fechar {
            position: absolute;

            top: 14px;
            right: 15px;

            width: 36px;
            height: 36px;

            display: flex;
            align-items: center;
            justify-content: center;

            border: 0;
            border-radius: 50%;

            background: #eef4fc;
            color: #49617f;

            font-size: 25px;
            line-height: 1;

            cursor: pointer;

            transition:
                background 0.2s,
                color 0.2s;
        }

        .modal-senha-fechar:hover {
            background: #dfeafb;
            color: #07162f;
        }

        .modal-senha-icone {
            width: 58px;
            height: 58px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin-bottom: 20px;

            border-radius: 16px;

            background: #e8f2ff;
            color: #096beb;

            font-size: 26px;
        }

        .modal-senha-icone.sucesso {
            border-radius: 50%;

            background: #e4f7ec;
            color: #168346;
        }

        .modal-senha-icone.erro {
            border-radius: 50%;

            background: #fdecec;
            color: #cc3030;
        }

        .modal-senha-titulo {
            margin: 0;

            color: #07162f;

            font-size: 27px;
            line-height: 1.2;
            letter-spacing: -0.5px;
        }

        .modal-senha-texto {
            margin-top: 13px;

            color: #61738f;

            font-size: 14px;
            line-height: 1.65;
        }

        .modal-senha-email {
            display: block;

            margin-top: 16px;
            padding: 13px 15px;

            border: 1px solid #d3dfed;
            border-radius: 10px;

            background: #f5f8fc;
            color: #096beb;

            font-size: 14px;
            font-weight: 800;

            overflow-wrap: anywhere;
        }

        .modal-senha-acoes {
            display: flex;
            justify-content: flex-end;

            gap: 12px;

            margin-top: 27px;
        }

        .modal-senha-btn {
            min-height: 45px;

            padding: 0 20px;

            border-radius: 9px;

            font-size: 14px;
            font-weight: 800;

            cursor: pointer;

            transition:
                transform 0.2s,
                box-shadow 0.2s,
                background 0.2s;
        }

        .modal-senha-btn-cancelar {
            border: 1px solid #c7d4e5;

            background: #ffffff;
            color: #49617f;
        }

        .modal-senha-btn-cancelar:hover {
            background: #f2f6fb;
        }

        .modal-senha-btn-enviar {
            border: 0;

            background:
                linear-gradient(
                    90deg,
                    #0865dc,
                    #176eff,
                    #1688ff
                );

            color: #ffffff;

            box-shadow:
                0 10px 24px
                rgba(9, 107, 235, 0.28);
        }

        .modal-senha-btn-enviar:hover {
            transform: translateY(-1px);

            box-shadow:
                0 14px 28px
                rgba(9, 107, 235, 0.34);
        }

        .modal-senha-btn:disabled {
            opacity: 0.65;

            cursor: wait;

            transform: none;
        }

        .modal-senha-mensagem {
            min-height: 20px;

            margin-top: 15px;

            color: #cc3030;

            font-size: 13px;
            line-height: 1.5;
        }

        .modal-senha-mensagem.sucesso {
            color: #168346;
        }

        @media (max-width: 520px) {

            .modal-senha-card {
                padding:
                    32px
                    22px
                    24px;
            }

            .modal-senha-titulo {
                font-size: 24px;
            }

            .modal-senha-acoes {
                flex-direction: column-reverse;
            }

            .modal-senha-btn {
                width: 100%;
            }
        }
    `;

    document.head.appendChild(
        estilo
    );

    const modal =
        document.createElement("div");

    modal.id =
        "modalAlterarSenhaUsuario";

    modal.className =
        "modal-senha-overlay";

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    modal.innerHTML = `

        <div
            class="modal-senha-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloModalSenha"
        >

            <button
                type="button"
                id="btnFecharModalSenha"
                class="modal-senha-fechar"
                aria-label="Fechar"
            >
                ×
            </button>

            <div
                id="iconeModalSenha"
                class="modal-senha-icone"
            >
                <i class="fa-solid fa-key"></i>
            </div>

            <h2
                id="tituloModalSenha"
                class="modal-senha-titulo"
            >
                Alterar senha
            </h2>

            <p
                id="textoModalSenha"
                class="modal-senha-texto"
            >
                Enviaremos um e-mail com um link seguro para você criar uma nova senha.
            </p>

            <strong
                id="emailModalSenha"
                class="modal-senha-email"
            >
                —
            </strong>

            <div
                id="mensagemModalSenha"
                class="modal-senha-mensagem"
                aria-live="polite"
            ></div>

            <div
                id="acoesModalSenha"
                class="modal-senha-acoes"
            >

                <button
                    type="button"
                    id="btnCancelarModalSenha"
                    class="
                        modal-senha-btn
                        modal-senha-btn-cancelar
                    "
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    id="btnEnviarModalSenha"
                    class="
                        modal-senha-btn
                        modal-senha-btn-enviar
                    "
                >
                    Enviar e-mail
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(
        modal
    );

    configurarEventosModalSenha();
}


// =====================================================
// ELEMENTOS DO MODAL
// =====================================================

function obterElementosModalSenha() {

    return {

        modal:
            document.getElementById(
                "modalAlterarSenhaUsuario"
            ),

        botaoFechar:
            document.getElementById(
                "btnFecharModalSenha"
            ),

        botaoCancelar:
            document.getElementById(
                "btnCancelarModalSenha"
            ),

        botaoEnviar:
            document.getElementById(
                "btnEnviarModalSenha"
            ),

        icone:
            document.getElementById(
                "iconeModalSenha"
            ),

        titulo:
            document.getElementById(
                "tituloModalSenha"
            ),

        texto:
            document.getElementById(
                "textoModalSenha"
            ),

        email:
            document.getElementById(
                "emailModalSenha"
            ),

        mensagem:
            document.getElementById(
                "mensagemModalSenha"
            ),

        acoes:
            document.getElementById(
                "acoesModalSenha"
            )
    };
}


// =====================================================
// PREPARAR MODAL PARA CONFIRMAÇÃO
// =====================================================

function prepararModalConfirmacaoSenha() {

    const elementos =
        obterElementosModalSenha();

    const usuario =
        auth.currentUser;

    elementos.icone.className =
        "modal-senha-icone";

    elementos.icone.innerHTML =
        '<i class="fa-solid fa-key"></i>';

    elementos.titulo.textContent =
        "Alterar senha";

    elementos.texto.textContent =
        "Enviaremos um e-mail com um link seguro para você criar uma nova senha.";

    elementos.email.style.display =
        "block";

    elementos.email.textContent =
        usuario?.email || "E-mail não identificado";

    elementos.mensagem.textContent =
        "";

    elementos.mensagem.className =
        "modal-senha-mensagem";

    elementos.acoes.style.display =
        "flex";

    elementos.botaoCancelar.textContent =
        "Cancelar";

    elementos.botaoEnviar.textContent =
        "Enviar e-mail";

    elementos.botaoEnviar.disabled =
        false;
}


// =====================================================
// ABRIR MODAL
// =====================================================

function abrirModalAlterarSenha() {

    criarModalAlterarSenha();

    prepararModalConfirmacaoSenha();

    const elementos =
        obterElementosModalSenha();

    elementos.modal.classList.add(
        "aberto"
    );

    elementos.modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-senha-aberto"
    );

    setTimeout(function () {

        elementos.botaoEnviar?.focus();

    }, 100);
}


// =====================================================
// FECHAR MODAL
// =====================================================

function fecharModalAlterarSenha() {

    const elementos =
        obterElementosModalSenha();

    if (!elementos.modal) {
        return;
    }

    elementos.modal.classList.remove(
        "aberto"
    );

    elementos.modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-senha-aberto"
    );

    btnUsuario?.focus();
}


// =====================================================
// MOSTRAR SUCESSO
// =====================================================

function mostrarSucessoEnvioSenha() {

    const elementos =
        obterElementosModalSenha();

    elementos.icone.className =
        "modal-senha-icone sucesso";

    elementos.icone.innerHTML =
        '<i class="fa-solid fa-check"></i>';

    elementos.titulo.textContent =
        "E-mail enviado!";

    elementos.texto.textContent =
        "Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada e também a pasta de spam.";

    elementos.email.style.display =
        "none";

    elementos.mensagem.textContent =
        "";

    elementos.acoes.style.display =
        "flex";

    elementos.botaoCancelar.style.display =
        "none";

    elementos.botaoEnviar.disabled =
        false;

    elementos.botaoEnviar.textContent =
        "Fechar";

    elementos.botaoEnviar.onclick =
        fecharModalAlterarSenha;
}


// =====================================================
// MOSTRAR ERRO
// =====================================================

function mostrarErroEnvioSenha(
    mensagem
) {

    const elementos =
        obterElementosModalSenha();

    elementos.icone.className =
        "modal-senha-icone erro";

    elementos.icone.innerHTML =
        '<i class="fa-solid fa-exclamation"></i>';

    elementos.titulo.textContent =
        "Não foi possível enviar";

    elementos.texto.textContent =
        mensagem;

    elementos.email.style.display =
        "none";

    elementos.mensagem.textContent =
        "";

    elementos.botaoCancelar.style.display =
        "none";

    elementos.botaoEnviar.disabled =
        false;

    elementos.botaoEnviar.textContent =
        "Fechar";

    elementos.botaoEnviar.onclick =
        fecharModalAlterarSenha;
}


// =====================================================
// TRADUZIR ERROS
// =====================================================

function traduzirErroAlteracaoSenha(
    codigo
) {

    const mensagens = {

        "auth/invalid-email":
            "O e-mail vinculado à conta é inválido.",

        "auth/user-disabled":
            "Esta conta está bloqueada.",

        "auth/too-many-requests":
            "Muitas solicitações foram realizadas. Aguarde alguns minutos e tente novamente.",

        "auth/network-request-failed":
            "Não foi possível acessar o servidor. Verifique sua conexão com a internet."
    };

    return mensagens[codigo] ||
        "Ocorreu um problema ao enviar o e-mail de redefinição. Tente novamente.";
}


// =====================================================
// ENVIAR E-MAIL DE ALTERAÇÃO DE SENHA
// =====================================================

async function enviarEmailAlteracaoSenha() {

    const elementos =
        obterElementosModalSenha();

    const usuario =
        auth.currentUser;

    if (!usuario?.email) {

        mostrarErroEnvioSenha(
            "Não foi possível identificar o e-mail do usuário conectado."
        );

        return;
    }

    elementos.botaoEnviar.disabled =
        true;

    elementos.botaoCancelar.disabled =
        true;

    elementos.botaoEnviar.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Enviando...
    `;

    elementos.mensagem.textContent =
        "";

    try {

        await sendPasswordResetEmail(
            auth,
            usuario.email
        );

        mostrarSucessoEnvioSenha();

    } catch (erro) {

        console.error(
            "Erro ao enviar alteração de senha:",
            erro
        );

        mostrarErroEnvioSenha(
            traduzirErroAlteracaoSenha(
                erro.code
            )
        );

    } finally {

        elementos.botaoCancelar.disabled =
            false;
    }
}


// =====================================================
// CONFIGURAR EVENTOS DO MODAL
// =====================================================

function configurarEventosModalSenha() {

    const elementos =
        obterElementosModalSenha();

    elementos.botaoFechar?.addEventListener(
        "click",
        fecharModalAlterarSenha
    );

    elementos.botaoCancelar?.addEventListener(
        "click",
        fecharModalAlterarSenha
    );

    elementos.botaoEnviar?.addEventListener(
        "click",
        enviarEmailAlteracaoSenha
    );

    elementos.modal?.addEventListener(
        "click",
        function (evento) {

            if (
                evento.target ===
                elementos.modal
            ) {

                fecharModalAlterarSenha();
            }
        }
    );
}


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

    menuUsuario?.classList.add(
        "aberto"
    );

    btnUsuario?.classList.add(
        "aberto"
    );

    btnUsuario?.setAttribute(
        "aria-expanded",
        "true"
    );
}


// =====================================================
// FECHAR MENU
// =====================================================

function fecharMenuUsuario() {

    menuUsuario?.classList.remove(
        "aberto"
    );

    btnUsuario?.classList.remove(
        "aberto"
    );

    btnUsuario?.setAttribute(
        "aria-expanded",
        "false"
    );
}


// =====================================================
// ALTERNAR MENU
// =====================================================

function alternarMenuUsuario() {

    if (!menuUsuario) {
        return;
    }

    const estaAberto =
        menuUsuario.classList.contains(
            "aberto"
        );

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
// BOTÃO ALTERAR SENHA
// =====================================================

btnAlterarSenha?.addEventListener(
    "click",
    function () {

        fecharMenuUsuario();

        abrirModalAlterarSenha();
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

        if (evento.key !== "Escape") {
            return;
        }

        const modal =
            document.getElementById(
                "modalAlterarSenhaUsuario"
            );

        if (
            modal?.classList.contains(
                "aberto"
            )
        ) {

            fecharModalAlterarSenha();

            return;
        }

        fecharMenuUsuario();

        btnUsuario?.focus();
    }
);


// =====================================================
// OBSERVAR ALTERAÇÕES FEITAS PELO AUTH-GUARD
// =====================================================

const observadorUsuario =
    new MutationObserver(
        function () {

            sincronizarDadosUsuario();
        }
    );


[
    avatarUsuario,
    nomeUsuarioTopo,
    perfilUsuarioTopo
].forEach(function (elemento) {

    if (!elemento) {
        return;
    }

    observadorUsuario.observe(
        elemento,
        {
            childList: true,
            characterData: true,
            subtree: true
        }
    );
});


// =====================================================
// SINCRONIZAÇÃO INICIAL
// =====================================================

sincronizarDadosUsuario();


// =====================================================
// MINHA CONTA
// =====================================================

btnMinhaConta?.addEventListener(
    "click",
    function(){

        if(
            typeof window.abrirModulo === "function"
        ){

            const menuUsuarios =
                document.querySelector(
                    '.menu a[data-modulo="usuarios"]'
                );

            window.abrirModulo(
                "minha-conta",
                menuUsuarios
            );

        }

    }
);




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
            btnLogout.disabled =
                true;

            btnLogout.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Saindo...
            `;

            // Encerra a sessão no Firebase
            await signOut(
                auth
            );

            // Limpa possíveis informações temporárias
            sessionStorage.clear();

            // Redireciona para o login
            window.location.replace(
                "./login.html"
            );

        } catch (erro) {

            console.error(
                "Erro ao sair do sistema:",
                erro
            );

            btnLogout.disabled =
                false;

            btnLogout.innerHTML =
                textoOriginal;

            alert(
                "Não foi possível encerrar a sessão. Tente novamente."
            );
        }
    }
);
