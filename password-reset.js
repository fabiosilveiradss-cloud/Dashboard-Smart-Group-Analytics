//-----------------------------------------------------
// IMPORTAÇÕES
//-----------------------------------------------------

import { auth } from "./firebase-config.js";

import {
    sendPasswordResetEmail
} from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


//-----------------------------------------------------
// ELEMENTOS
//-----------------------------------------------------

const btnEsqueciSenha =
    document.getElementById("btnEsqueciSenha");

const modalRecuperarSenha =
    document.getElementById("modalRecuperarSenha");

const btnFecharRecuperacao =
    document.getElementById("btnFecharRecuperacao");

const btnCancelarRecuperacao =
    document.getElementById("btnCancelarRecuperacao");

const formRecuperarSenha =
    document.getElementById("formRecuperarSenha");

const campoEmailLogin =
    document.getElementById("email");

const emailRecuperacao =
    document.getElementById("emailRecuperacao");

const mensagemRecuperacao =
    document.getElementById("mensagemRecuperacao");

const btnEnviarRecuperacao =
    document.getElementById("btnEnviarRecuperacao");


//-----------------------------------------------------
// ABRIR MODAL
//-----------------------------------------------------

function abrirModalRecuperacao() {

    if (!modalRecuperarSenha) {
        return;
    }

    limparMensagemRecuperacao();

    const emailDigitado =
        campoEmailLogin?.value
            .trim()
            .toLowerCase() || "";

    emailRecuperacao.value =
        emailDigitado;

    modalRecuperarSenha.classList.add(
        "aberto"
    );

    modalRecuperarSenha.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-aberto"
    );

    setTimeout(function () {

        emailRecuperacao?.focus();

    }, 100);
}


//-----------------------------------------------------
// FECHAR MODAL
//-----------------------------------------------------

function fecharModalRecuperacao() {

    if (!modalRecuperarSenha) {
        return;
    }

    modalRecuperarSenha.classList.remove(
        "aberto"
    );

    modalRecuperarSenha.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-aberto"
    );

    limparMensagemRecuperacao();

    btnEsqueciSenha?.focus();
}


//-----------------------------------------------------
// LIMPAR MENSAGEM
//-----------------------------------------------------

function limparMensagemRecuperacao() {

    if (!mensagemRecuperacao) {
        return;
    }

    mensagemRecuperacao.textContent =
        "";

    mensagemRecuperacao.classList.remove(
        "sucesso"
    );
}


//-----------------------------------------------------
// MOSTRAR ERRO
//-----------------------------------------------------

function mostrarErroRecuperacao(mensagem) {

    mensagemRecuperacao.textContent =
        mensagem;

    mensagemRecuperacao.classList.remove(
        "sucesso"
    );
}


//-----------------------------------------------------
// MOSTRAR SUCESSO
//-----------------------------------------------------

function mostrarSucessoRecuperacao(mensagem) {

    mensagemRecuperacao.textContent =
        mensagem;

    mensagemRecuperacao.classList.add(
        "sucesso"
    );
}


//-----------------------------------------------------
// TRADUZIR ERROS
//-----------------------------------------------------

function traduzirErroRecuperacao(codigo) {

    const mensagens = {

        "auth/invalid-email":
            "Digite um endereço de e-mail válido.",

        "auth/missing-email":
            "Informe seu endereço de e-mail.",

        "auth/user-disabled":
            "Este usuário está bloqueado.",

        "auth/too-many-requests":
            "Muitas solicitações foram realizadas. Aguarde alguns minutos.",

        "auth/network-request-failed":
            "Não foi possível acessar o servidor. Verifique sua internet."
    };

    return mensagens[codigo] ||
        "Não foi possível enviar o e-mail de recuperação. Tente novamente.";
}


//-----------------------------------------------------
// ENVIAR RECUPERAÇÃO
//-----------------------------------------------------

formRecuperarSenha?.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();

        const email =
            emailRecuperacao.value
                .trim()
                .toLowerCase();

        limparMensagemRecuperacao();

        if (!email) {

            mostrarErroRecuperacao(
                "Informe seu endereço de e-mail."
            );

            emailRecuperacao.focus();

            return;
        }

        btnEnviarRecuperacao.disabled =
            true;

        btnEnviarRecuperacao.textContent =
            "Enviando...";

        try {

            await sendPasswordResetEmail(
                auth,
                email
            );

            mostrarSucessoRecuperacao(
                "E-mail enviado. Verifique sua caixa de entrada e também a pasta de spam."
            );

        } catch (erro) {

            console.error(
                "Erro ao recuperar senha:",
                erro
            );

            mostrarErroRecuperacao(
                traduzirErroRecuperacao(
                    erro.code
                )
            );

        } finally {

            btnEnviarRecuperacao.disabled =
                false;

            btnEnviarRecuperacao.textContent =
                "Enviar e-mail";
        }
    }
);


//-----------------------------------------------------
// EVENTOS DOS BOTÕES
//-----------------------------------------------------

btnEsqueciSenha?.addEventListener(
    "click",
    abrirModalRecuperacao
);

btnFecharRecuperacao?.addEventListener(
    "click",
    fecharModalRecuperacao
);

btnCancelarRecuperacao?.addEventListener(
    "click",
    fecharModalRecuperacao
);


//-----------------------------------------------------
// FECHAR CLICANDO FORA
//-----------------------------------------------------

modalRecuperarSenha?.addEventListener(
    "click",
    function (evento) {

        if (
            evento.target ===
            modalRecuperarSenha
        ) {

            fecharModalRecuperacao();
        }
    }
);


//-----------------------------------------------------
// FECHAR COM ESC
//-----------------------------------------------------

document.addEventListener(
    "keydown",
    function (evento) {

        const modalEstaAberto =
            modalRecuperarSenha?.classList.contains(
                "aberto"
            );

        if (
            evento.key === "Escape" &&
            modalEstaAberto
        ) {

            fecharModalRecuperacao();
        }
    }
);
