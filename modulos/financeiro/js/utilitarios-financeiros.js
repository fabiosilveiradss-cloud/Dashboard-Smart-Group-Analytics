"use strict";

/* Utilitários: textos, moedas, datas e agrupamentos. */

function preencherTexto(id, texto) {
    const elemento =
        document.getElementById(id);

    if (elemento) {
        elemento.textContent = texto;
    }
}

function formatarMoeda(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "R$ 0,00";
    }

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function identificarBanco(
    nomeBanco,
    siglaPlanilha
) {
    const nome =
        normalizarTexto(nomeBanco);

    const catalogo = [
        {
            termos: ["banco do brasil"],
            id: "banco-do-brasil",
            sigla: "BB",
            logo: "assets/bancos/banco-do-brasil.svg",
            cor: "#f6d000"
        },
        {
            termos: ["sicredi"],
            id: "sicredi",
            sigla: "SI",
            logo: "assets/bancos/sicredi.svg",
            cor: "#59a52c"
        },
        {
            termos: ["caixa"],
            id: "caixa",
            sigla: "CX",
            logo: "assets/bancos/caixa.svg",
            cor: "#0074b8"
        },
        {
            termos: ["itau"],
            id: "itau",
            sigla: "IT",
            logo: "assets/bancos/itau.svg",
            cor: "#ec7000"
        },
        {
            termos: ["bradesco"],
            id: "bradesco",
            sigla: "BR",
            logo: "assets/bancos/bradesco.svg",
            cor: "#cc092f"
        },
        {
            termos: ["santander"],
            id: "santander",
            sigla: "ST",
            logo: "assets/bancos/santander.svg",
            cor: "#ec0000"
        },
        {
            termos: ["sicoob"],
            id: "sicoob",
            sigla: "SC",
            logo: "assets/bancos/sicoob.svg",
            cor: "#1d6b55"
        }
    ];

    const encontrado =
        catalogo.find((banco) => {
            return banco.termos.some((termo) => {
                return nome.includes(termo);
            });
        });

    if (encontrado) {
        return encontrado;
    }

    return {
        id: gerarIdentificador(nomeBanco),
        sigla:
            siglaPlanilha ||
            gerarSiglaBanco(nomeBanco),
        logo: "assets/bancos/banco-generico.svg",
        cor: "#1683ff"
    };
}

function converterNumeroFinanceiro(valor) {
    if (typeof valor === "number") {
        return Number.isFinite(valor)
            ? valor
            : 0;
    }

    const texto =
        String(valor || "")
            .trim()
            .replace(/\s/g, "")
            .replace(/R\$/gi, "");

    if (!texto) {
        return 0;
    }

    let normalizado = texto;

    if (
        normalizado.includes(".") &&
        normalizado.includes(",")
    ) {
        normalizado =
            normalizado
                .replace(/\./g, "")
                .replace(",", ".");
    } else if (normalizado.includes(",")) {
        normalizado =
            normalizado.replace(",", ".");
    }

    const numero =
        Number(normalizado);

    return Number.isFinite(numero)
        ? numero
        : 0;
}

function normalizarTexto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[./_()-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function gerarIdentificador(nome) {
    return normalizarTexto(nome)
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}

function gerarSiglaBanco(nome) {
    const palavras =
        String(nome || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    return palavras
        .slice(0, 2)
        .map((palavra) => palavra[0])
        .join("")
        .toUpperCase() || "BK";
}

function converterDataExcel(valor) {
    if (!valor || valor === "00/00/0000") return null;

    if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
        return inicioDoDia(valor);
    }

    if (typeof valor === "number" && Number.isFinite(valor)) {
        const partes = XLSX.SSF.parse_date_code(valor);
        if (!partes) return null;
        return new Date(partes.y, partes.m - 1, partes.d);
    }

    const texto = String(valor).trim();
    if (!texto || texto === "00/00/0000") return null;

    const br = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (br) {
        const data = new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
        return Number.isNaN(data.getTime()) ? null : data;
    }

    const iso = new Date(texto);
    return Number.isNaN(iso.getTime()) ? null : inicioDoDia(iso);
}

function inicioDoDia(data) {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function agruparPor(lista, obterChave, campoValor) {
    const mapa = new Map();
    lista.forEach((item) => {
        const chave = obterChave(item);
        if (!chave) return;
        mapa.set(chave, (mapa.get(chave) || 0) + Number(item[campoValor] || 0));
    });
    return mapa;
}

function ordenarMapa(mapa) {
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
}

function somar(lista, campo) {
    return lista.reduce((total, item) => total + Number(item[campo] || 0), 0);
}

function chaveMes(data) {
    if (!data) return "";
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

function formatarChaveMes(chave) {
    const [ano, mes] = chave.split("-").map(Number);
    return new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit"
    });
}

function formatarDataISO(data) {
    return [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, "0"),
        String(data.getDate()).padStart(2, "0")
    ].join("-");
}

function formatarDataInput(data) {
    return formatarDataISO(data);
}

function formatarDataBR(data) {
    return data
        ? data.toLocaleDateString("pt-BR")
        : "-";
}

function formatarDataCurta(data) {
    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit"
    });
}

function lerDataInput(id) {
    const valor = document.getElementById(id)?.value;
    if (!valor) return null;
    const [ano, mes, dia] = valor.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
}

function formatarNumeroCompacto(valor) {
    return new Intl.NumberFormat("pt-BR", {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(valor);
}

function abreviarTexto(texto, limite) {
    const valor = String(texto || "");
    return valor.length > limite
        ? `${valor.slice(0, limite - 1)}…`
        : valor;
}

