// =====================================
// MINHA CONTA
// SMART GROUP ANALYTICS
// =====================================


const usuario =
window.parent.usuarioAnalytics;



if(!usuario){

document.body.innerHTML = `

<h2 style="color:white">

Usuário não encontrado.

</h2>

`;

throw new Error(
"Usuário não carregado"
);

}



const nome =
usuario.nome || "Usuário";


const email =
usuario.emailFirebase || "-";


const perfil =
usuario.perfil || "Usuário";



document.getElementById("nome").textContent =
nome;


document.getElementById("email").textContent =
email;


document.getElementById("nomeCompleto").textContent =
nome;


document.getElementById("emailCompleto").textContent =
email;


document.getElementById("perfil").textContent =
perfil;



document.getElementById("cargo").textContent =
usuario.cargo || "-";


document.getElementById("setor").textContent =
usuario.setor || "-";


document.getElementById("empresa").textContent =
usuario.empresa || "Smart Group";



document.getElementById("status").textContent =
usuario.ativo
?"Ativo"
:"Inativo";



const inicial =
nome.charAt(0).toUpperCase();



document.getElementById("avatar").textContent =
inicial;



// ===============================
// PERMISSÕES
// ===============================


const lista =
document.getElementById("listaPermissoes");


const modulos =
usuario.modulos || {};



if(
perfil.toLowerCase()==="administrador"
){

lista.innerHTML = `

<div class="permissao">
Administrador - acesso total
</div>

`;

}

else{


Object.keys(modulos)

.filter(
item=>modulos[item]===true
)

.forEach(
modulo=>{


lista.innerHTML += `

<div class="permissao">

${modulo}

</div>

`;

});


}
