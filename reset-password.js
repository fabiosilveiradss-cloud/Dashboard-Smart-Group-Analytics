//-----------------------------------------------------
// IMPORTAÇÕES
//-----------------------------------------------------

import { auth } from "./firebase-config.js";

import {
    verifyPasswordResetCode,
    confirmPasswordReset
} from
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


//-----------------------------------------------------
// ELEMENTOS
//-----------------------------------------------------

const estadoCarregando =
    document.getElementById("estadoCarregando");

const estadoFormulario =
    document.getElementById("estadoFormulario");

const estadoSucesso =
    document.getElementById("estadoSucesso");

const estadoErro =
    document.getElementById("estadoErro");

const emailUsuario =
    document.getElementById("emailUsuario");

const formNovaSenha =
    document.getElementById("formNovaSenha");

const campoNovaSenha =
    document.getElementById("novaSenha");

const campoConfirmarSenha =
    document.getElementById("confirmarSenha");

const barraForcaSenha =
    document.getElementById("barraForcaSenha");

const textoForcaSenha =
    document.getElementById("textoForcaSenha");

const statusConfirmacao =
    document.getElementById("statusConfirmacao");

const mensagemReset =
    document.getElementById("mensagemReset");

const btnAlterarSenha =
    document.getElementById("btnAlterarSenha");

const tituloErro =
    document.getElementById("tituloErro");

const descricaoErro =
    document.getElementById("descricaoErro");


//-----------------------------------------------------
// PARÂMETROS DO LINK
//-----------------------------------------------------

const parametros =
    new URLSearchParams(
        window.location.search
    );

const modo =
    parametros.get("mode");

const codigoAcao =
    parametros.get("oobCode");


//-----------------------------------------------------
// CONTROLE DAS TELAS
//-----------------------------------------------------

function mostrarEstado(elemento) {

    [
        estadoCarregando,
        estadoFormulario,
        estadoSucesso,
        estadoErro
    ].forEach(function (estado) {

        estado?.classList.add(
            "oculto"
        );
    });

    elemento?.classList.remove(
        "oculto"
    );
}


//-----------------------------------------------------
// MOSTRAR ERRO DO LINK
//-----------------------------------------------------

function mostrarErroLink(
    titulo,
    descricao
) {

    tituloErro.textContent =
        titulo;

    descricaoErro.textContent =
        descricao;

    mostrarEstado(
        estadoErro
    );
}


//-----------------------------------------------------
// TRADUZIR ERROS
//-----------------------------------------------------

function traduzirErroReset(codigo) {

    const mensagens = {

        "auth/expired-action-code":
            "Este link de recuperação expirou. Solicite um novo link na tela de login.",

        "auth/invalid-action-code":
            "Este link é inválido ou já foi utilizado. Solicite um novo link.",

        "auth/weak-password":
            "A senha informada é muito fraca. Utilize uma senha mais segura.",

        "auth/user-disabled":
            "Esta conta está bloqueada.",

        "auth/user-not-found":
            "A conta vinculada a este link não foi encontrada.",

        "auth/network-request-failed":
            "Não foi possível acessar o servidor. Verifique sua conexão com a internet.",

        "auth/too-many-requests":
            "Muitas tentativas foram realizadas. Aguarde alguns minutos."
    };

    return mensagens[codigo] ||
        "Não foi possível alterar a senha. Tente novamente.";
}


//-----------------------------------------------------
// VALIDAR LINK DO FIREBASE
//-----------------------------------------------------

async function validarLinkRecuperacao() {

    if (
        modo !== "resetPassword" ||
        !codigoAcao
    ) {

        mostrarErroLink(
            "Link incompleto",
            "O endereço de recuperação não possui as informações necessárias."
        );

        return;
    }

    try {

        const email =
            await verifyPasswordResetCode(
                auth,
                codigoAcao
            );

        emailUsuario.textContent =
            email;

        mostrarEstado(
            estadoFormulario
        );

        campoNovaSenha.focus();

    } catch (erro) {

        console.error(
            "Erro ao validar link:",
            erro
        );

        mostrarErroLink(
            "Link inválido ou expirado",
            traduzirErroReset(
                erro.code
            )
        );
    }
}


//-----------------------------------------------------
// VERIFICAR FORÇA DA SENHA
//-----------------------------------------------------

function calcularForcaSenha(senha) {

    let pontos = 0;

    if (senha.length >= 8) {
        pontos++;
    }

    if (senha.length >= 12) {
        pontos++;
    }

    if (/[a-z]/.test(senha) &&
        /[A-Z]/.test(senha)) {
        pontos++;
    }

    if (/\d/.test(senha)) {
        pontos++;
    }

    if (/[^A-Za-z0-9]/.test(senha)) {
        pontos++;
    }

    return pontos;
}


function atualizarForcaSenha() {

    const senha =
        campoNovaSenha.value;

    const pontos =
        calcularForcaSenha(
            senha
        );

    barraForcaSenha.className =
        "";

    if (!senha) {

        barraForcaSenha.style.width =
            "0";

        textoForcaSenha.textContent =
            "Digite pelo menos 8 caracteres.";

        textoForcaSenha.className =
            "";

        return;
    }

    if (pontos <= 1) {

        barraForcaSenha.style.width =
            "25%";

        barraForcaSenha.classList.add(
            "fraca"
        );

        textoForcaSenha.textContent =
            "Senha fraca";

        textoForcaSenha.className =
            "fraca";

    } else if (pontos <= 3) {

        barraForcaSenha.style.width =
            "60%";

        barraForcaSenha.classList.add(
            "media"
        );

        textoForcaSenha.textContent =
            "Senha média";

        textoForcaSenha.className =
            "media";

    } else {

        barraForcaSenha.style.width =
            "100%";

        barraForcaSenha.classList.add(
            "forte"
        );

        textoForcaSenha.textContent =
            "Senha forte";

        textoForcaSenha.className =
            "forte";
    }
}


//-----------------------------------------------------
// VERIFICAR CONFIRMAÇÃO
//-----------------------------------------------------

function atualizarConfirmacaoSenha() {

    const senha =
        campoNovaSenha.value;

    const confirmacao =
        campoConfirmarSenha.value;

    statusConfirmacao.textContent =
        "";

    statusConfirmacao.className =
        "status-confirmacao";

    if (!confirmacao) {
        return;
    }

    if (senha === confirmacao) {

        statusConfirmacao.textContent =
            "✓ As senhas coincidem.";

        statusConfirmacao.classList.add(
            "valido"
        );

    } else {

        statusConfirmacao.textContent =
            "As senhas ainda não coincidem.";

        statusConfirmacao.classList.add(
            "invalido"
        );
    }
}


//-----------------------------------------------------
// MOSTRAR OU OCULTAR SENHAS
//-----------------------------------------------------

document.querySelectorAll(
    ".mostrar-senha"
).forEach(function (botao) {

    botao.addEventListener(
        "click",
        function () {

            const idCampo =
                botao.dataset.campo;

            const campo =
                document.getElementById(
                    idCampo
                );

            if (!campo) {
                return;
            }

            const senhaOculta =
                campo.type === "password";

            campo.type =
                senhaOculta
                    ? "text"
                    : "password";

            botao.textContent =
                senhaOculta
                    ? "🙈"
                    : "👁";

            botao.setAttribute(
                "aria-label",
                senhaOculta
                    ? "Ocultar senha"
                    : "Mostrar senha"
            );
        }
    );
});


//-----------------------------------------------------
// EVENTOS DOS CAMPOS
//-----------------------------------------------------

campoNovaSenha?.addEventListener(
    "input",
    function () {

        atualizarForcaSenha();
        atualizarConfirmacaoSenha();
        limparMensagem();
    }
);

campoConfirmarSenha?.addEventListener(
    "input",
    function () {

        atualizarConfirmacaoSenha();
        limparMensagem();
    }
);


//-----------------------------------------------------
// MENSAGENS
//-----------------------------------------------------

function limparMensagem() {

    mensagemReset.textContent =
        "";

    mensagemReset.classList.remove(
        "sucesso"
    );
}


function mostrarMensagemErro(mensagem) {

    mensagemReset.textContent =
        mensagem;

    mensagemReset.classList.remove(
        "sucesso"
    );
}


//-----------------------------------------------------
// ALTERAR SENHA
//-----------------------------------------------------

formNovaSenha?.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();

        limparMensagem();

        const novaSenha =
            campoNovaSenha.value;

        const confirmarSenha =
            campoConfirmarSenha.value;

        if (novaSenha.length < 8) {

            mostrarMensagemErro(
                "A nova senha deve possuir pelo menos 8 caracteres."
            );

            campoNovaSenha.focus();

            return;
        }

        if (novaSenha !== confirmarSenha) {

            mostrarMensagemErro(
                "As senhas digitadas não coincidem."
            );

            campoConfirmarSenha.focus();

            return;
        }

        btnAlterarSenha.disabled =
            true;

        btnAlterarSenha.textContent =
            "Alterando senha...";

        try {

            await confirmPasswordReset(
                auth,
                codigoAcao,
                novaSenha
            );

            formNovaSenha.reset();

            mostrarEstado(
                estadoSucesso
            );

        } catch (erro) {

            console.error(
                "Erro ao alterar senha:",
                erro
            );

            mostrarMensagemErro(
                traduzirErroReset(
                    erro.code
                )
            );

        } finally {

            btnAlterarSenha.disabled =
                false;

            btnAlterarSenha.textContent =
                "Alterar senha";
        }
    }
);


//-----------------------------------------------------
// INICIAR
//-----------------------------------------------------

validarLinkRecuperacao();
