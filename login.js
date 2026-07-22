//-----------------------------------------------------
// IMPORTAÇÕES
//-----------------------------------------------------

import { auth } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


//-----------------------------------------------------
// ELEMENTOS
//-----------------------------------------------------

const formLogin =
    document.getElementById("formLogin");

const campoEmail =
    document.getElementById("email");

const campoSenha =
    document.getElementById("senha");

const permanecerConectado =
    document.getElementById("permanecerConectado");

const mensagemLogin =
    document.getElementById("mensagemLogin");

const btnEntrar =
    document.getElementById("btnEntrar");

const btnMostrarSenha =
    document.getElementById("btnMostrarSenha");


//-----------------------------------------------------
// SAUDAÇÃO
//-----------------------------------------------------

function atualizarSaudacaoLogin() {

    const hora =
        new Date().getHours();

    let saudacao =
        "Olá!";

    if (hora >= 5 && hora < 12) {

        saudacao =
            "☀️ Bom dia!";

    } else if (hora >= 12 && hora < 18) {

        saudacao =
            "🌤️ Boa tarde!";

    } else {

        saudacao =
            "🌙 Boa noite!";
    }

    const elemento =
        document.getElementById("saudacaoLogin");

    if (elemento) {

        elemento.textContent =
            saudacao;
    }
}


//-----------------------------------------------------
// MOSTRAR OU OCULTAR SENHA
//-----------------------------------------------------

btnMostrarSenha?.addEventListener(
    "click",
    function () {

        const estaOculta =
            campoSenha.type === "password";

        campoSenha.type =
            estaOculta
                ? "text"
                : "password";

        btnMostrarSenha.textContent =
            estaOculta
                ? "🙈"
                : "👁";

        btnMostrarSenha.setAttribute(
            "aria-label",
            estaOculta
                ? "Ocultar senha"
                : "Mostrar senha"
        );
    }
);


//-----------------------------------------------------
// LOGIN
//-----------------------------------------------------

formLogin?.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const email =
            campoEmail.value
                .trim()
                .toLowerCase();

        const senha =
            campoSenha.value;

        mensagemLogin.textContent =
            "";

        mensagemLogin.classList.remove(
            "sucesso"
        );

        btnEntrar.disabled =
            true;

        btnEntrar.textContent =
            "Entrando...";

        try {

            const persistencia =
                permanecerConectado.checked
                    ? browserLocalPersistence
                    : browserSessionPersistence;

            await setPersistence(
                auth,
                persistencia
            );

            await signInWithEmailAndPassword(
                auth,
                email,
                senha
            );

            mensagemLogin.textContent =
                "Login realizado. Preparando seu ambiente...";

            mensagemLogin.classList.add(
                "sucesso"
            );

            setTimeout(function () {

                window.location.replace(
                    "index.html"
                );

            }, 700);

        } catch (erro) {

            console.error(
                "Erro no login:",
                erro
            );

            mensagemLogin.textContent =
                traduzirErroLogin(
                    erro.code
                );

        } finally {

            btnEntrar.disabled =
                false;

            btnEntrar.textContent =
                "Entrar";
        }
    }
);


//-----------------------------------------------------
// TRADUZIR ERROS
//-----------------------------------------------------

function traduzirErroLogin(codigo) {

    const mensagens = {

        "auth/invalid-email":
            "Digite um endereço de e-mail válido.",

        "auth/missing-password":
            "Digite sua senha.",

        "auth/invalid-credential":
            "E-mail ou senha incorretos.",

        "auth/user-disabled":
            "Este usuário está bloqueado.",

        "auth/too-many-requests":
            "Muitas tentativas. Aguarde alguns minutos e tente novamente.",

        "auth/network-request-failed":
            "Não foi possível acessar o servidor. Verifique sua internet."
    };

    return mensagens[codigo] ||
        "Não foi possível realizar o login. Tente novamente.";
}


//-----------------------------------------------------
// USUÁRIO JÁ CONECTADO
//-----------------------------------------------------

onAuthStateChanged(
    auth,
    function (usuario) {

        if (usuario) {

            window.location.replace(
                "index.html"
            );
        }
    }
);


//-----------------------------------------------------
// INICIAR
//-----------------------------------------------------

atualizarSaudacaoLogin();
