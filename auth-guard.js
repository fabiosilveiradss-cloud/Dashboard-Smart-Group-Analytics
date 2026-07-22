//-----------------------------------------------------
// IMPORTAÇÕES
//-----------------------------------------------------

import { auth } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


//-----------------------------------------------------
// VERIFICAR AUTENTICAÇÃO
//-----------------------------------------------------

onAuthStateChanged(auth, function (usuario) {

    if (!usuario) {

        window.location.replace("login.html");

        return;
    }

    /*
      Só mostra o dashboard depois que o Firebase
      confirmar que o usuário está autenticado.
    */

    document.body.classList.remove(
        "auth-pendente"
    );
});
