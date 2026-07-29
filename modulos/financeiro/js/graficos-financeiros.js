"use strict";

/* Gráficos e tabela de contas em atraso. */

function renderizarGraficos(dados) {
    if (typeof Chart === "undefined") {
        atualizarStatusImportacao(
            "A planilha foi carregada, mas a biblioteca dos gráficos não abriu.",
            "erro"
        );
        return;
    }

    const clientesPagos = dados.filter(
        (item) => item.tipoCadastro === "cliente" && item.pago
    );
    const fornecedoresPagos = dados.filter(
        (item) => item.tipoCadastro === "fornecedor" && item.pago
    );

    renderizarFluxoCaixa(clientesPagos, fornecedoresPagos);
    renderizarRecebimentosDia(clientesPagos);
    renderizarTopClientes(clientesPagos);
    renderizarRecebimentosBanco(clientesPagos);
    renderizarPlanoFinanceiro(clientesPagos);
    renderizarRepresentantes(clientesPagos);
    renderizarSituacaoReceber(
        dados.filter((item) => item.tipoCadastro === "cliente")
    );
}

function renderizarFluxoCaixa(recebimentos, pagamentos) {
    const chaves = [...new Set([
        ...recebimentos.map((item) => chaveMes(item.dataPagamento)),
        ...pagamentos.map((item) => chaveMes(item.dataPagamento))
    ].filter(Boolean))].sort();

    const mapaRecebimentos = agruparPor(
        recebimentos.filter((item) => item.dataPagamento),
        (item) => chaveMes(item.dataPagamento),
        "valorLiquidoPago"
    );
    const mapaPagamentos = agruparPor(
        pagamentos.filter((item) => item.dataPagamento),
        (item) => chaveMes(item.dataPagamento),
        "valorLiquidoPago"
    );

    criarOuAtualizarGrafico("fluxoCaixa", "graficoFluxoCaixa", {
        type: "line",
        data: {
            labels: chaves.map(formatarChaveMes),
            datasets: [
                {
                    label: "Recebimentos",
                    data: chaves.map((chave) => mapaRecebimentos.get(chave) || 0),
                    borderColor: "#27d17f",
                    backgroundColor: "rgba(39, 209, 127, 0.14)",
                    tension: 0.3,
                    fill: true
                },
                {
                    label: "Pagamentos",
                    data: chaves.map((chave) => mapaPagamentos.get(chave) || 0),
                    borderColor: "#ff665c",
                    backgroundColor: "rgba(255, 102, 92, 0.10)",
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: opcoesGraficoCartesiano()
    });
}

function renderizarRecebimentosDia(recebimentos) {
    const mapa = agruparPor(
        recebimentos.filter((item) => item.dataPagamento),
        (item) => formatarDataISO(item.dataPagamento),
        "valorLiquidoPago"
    );
    const chaves = [...mapa.keys()].sort();

    criarOuAtualizarGrafico("recebimentosDia", "graficoRecebimentosDia", {
        type: "bar",
        data: {
            labels: chaves.map((chave) => formatarDataCurta(new Date(`${chave}T00:00:00`))),
            datasets: [{
                label: "Valor recebido",
                data: chaves.map((chave) => mapa.get(chave)),
                backgroundColor: "#1683ff",
                borderRadius: 5
            }]
        },
        options: opcoesGraficoCartesiano()
    });
}

function renderizarTopClientes(recebimentos) {
    const mapa = agruparPor(recebimentos, (item) => item.razaoSocial, "valorLiquidoPago");
    const ranking = ordenarMapa(mapa).slice(0, 10).reverse();

    criarOuAtualizarGrafico("topClientes", "graficoTopClientes", {
        type: "bar",
        data: {
            labels: ranking.map(([nome]) => abreviarTexto(nome, 28)),
            datasets: [{
                label: "Recebido",
                data: ranking.map(([, valor]) => valor),
                backgroundColor: "#27d17f",
                borderRadius: 5
            }]
        },
        options: opcoesGraficoHorizontal()
    });
}

function renderizarRecebimentosBanco(recebimentos) {
    const validos = recebimentos.filter(
        (item) => normalizarTexto(item.banco) !== "nao informado"
    );
    const mapa = agruparPor(validos, (item) => item.banco, "valorLiquidoPago");
    const ranking = ordenarMapa(mapa).slice(0, 8);

    criarOuAtualizarGrafico("recebimentosBanco", "graficoRecebimentosBanco", {
        type: "doughnut",
        data: {
            labels: ranking.map(([nome]) => nome),
            datasets: [{
                data: ranking.map(([, valor]) => valor),
                backgroundColor: [
                    "#1683ff", "#27d17f", "#ff9f43", "#8f61e8",
                    "#31c6d4", "#f15bb5", "#a0aec0", "#f6d000"
                ],
                borderWidth: 0
            }]
        },
        options: opcoesGraficoRosca()
    });
}

function renderizarPlanoFinanceiro(recebimentos) {
    const mapa = agruparPor(
        recebimentos,
        (item) => item.planoFinanceiro || "Não informado",
        "valorLiquidoPago"
    );
    const ranking = ordenarMapa(mapa).slice(0, 8).reverse();

    criarOuAtualizarGrafico("planoFinanceiro", "graficoPlanoFinanceiro", {
        type: "bar",
        data: {
            labels: ranking.map(([nome]) => abreviarTexto(nome, 24)),
            datasets: [{
                label: "Recebido",
                data: ranking.map(([, valor]) => valor),
                backgroundColor: "#8f61e8",
                borderRadius: 5
            }]
        },
        options: opcoesGraficoHorizontal()
    });
}

function renderizarRepresentantes(recebimentos) {
    const mapa = agruparPor(
        recebimentos,
        (item) => item.representante || "Não informado",
        "valorLiquidoPago"
    );
    const ranking = ordenarMapa(mapa).slice(0, 10).reverse();

    criarOuAtualizarGrafico("representantes", "graficoRepresentantes", {
        type: "bar",
        data: {
            labels: ranking.map(([nome]) => abreviarTexto(nome, 22)),
            datasets: [{
                label: "Recebido",
                data: ranking.map(([, valor]) => valor),
                backgroundColor: "#1683ff",
                borderRadius: 5
            }]
        },
        options: opcoesGraficoHorizontal()
    });
}

function renderizarSituacaoReceber(clientes) {
    const pago = somar(clientes.filter((item) => item.pago), "valorLiquidoPago");
    const aberto = somar(
        clientes.filter((item) => item.situacao === "aberto"),
        "valorDocumento"
    );
    const atraso = somar(
        clientes.filter((item) => item.situacao === "atrasado"),
        "valorDocumento"
    );

    criarOuAtualizarGrafico("situacaoReceber", "graficoSituacaoReceber", {
        type: "doughnut",
        data: {
            labels: ["Pago", "A receber", "Em atraso"],
            datasets: [{
                data: [pago, aberto, atraso],
                backgroundColor: ["#27d17f", "#1683ff", "#ff4d4d"],
                borderWidth: 0
            }]
        },
        options: opcoesGraficoRosca()
    });
}

function renderizarTabelaAtrasos(dados) {
    const corpo = document.getElementById("corpoTabelaAtrasos");
    const contador = document.getElementById("contadorAtrasos");
    if (!corpo) return;

    const hoje = inicioDoDia(new Date());
    const atrasados = dados
        .filter((item) => item.tipoCadastro === "cliente" && item.atrasado)
        .sort((a, b) => a.vencimento - b.vencimento);

    if (contador) contador.textContent = String(atrasados.length);

    if (!atrasados.length) {
        corpo.innerHTML = `
            <tr>
                <td colspan="7" class="tabela-vazia">
                    Nenhuma conta em atraso no período selecionado.
                </td>
            </tr>
        `;
        return;
    }

    corpo.innerHTML = atrasados.slice(0, 15).map((item) => {
        const dias = Math.max(
            0,
            Math.floor((hoje - inicioDoDia(item.vencimento)) / 86400000)
        );

        return `
            <tr>
                <td title="${escaparHtml(item.razaoSocial)}">
                    ${escaparHtml(abreviarTexto(item.razaoSocial, 34))}
                </td>
                <td>${escaparHtml(item.documento || "-")}</td>
                <td>${formatarDataBR(item.vencimento)}</td>
                <td><span class="dias-atraso">${dias}</span></td>
                <td>${formatarMoeda(item.valorDocumento)}</td>
                <td>${escaparHtml(item.banco)}</td>
                <td>${escaparHtml(item.representante)}</td>
            </tr>
        `;
    }).join("");
}

function criarOuAtualizarGrafico(chave, canvasId, configuracao) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (graficosFinanceiros[chave]) {
        graficosFinanceiros[chave].destroy();
    }

    graficosFinanceiros[chave] = new Chart(canvas, configuracao);
}

function opcoesGraficoCartesiano() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: { labels: { color: "#dbeafe", boxWidth: 12 } },
            tooltip: {
                callbacks: {
                    label: (contexto) =>
                        `${contexto.dataset.label}: ${formatarMoeda(contexto.raw)}`
                }
            }
        },
        scales: {
            x: {
                ticks: { color: "#9fb7d5", maxRotation: 0 },
                grid: { color: "rgba(255,255,255,0.04)" }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: "#9fb7d5",
                    callback: (valor) => formatarNumeroCompacto(valor)
                },
                grid: { color: "rgba(255,255,255,0.06)" }
            }
        }
    };
}

function opcoesGraficoHorizontal() {
    const opcoes = opcoesGraficoCartesiano();
    opcoes.indexAxis = "y";
    opcoes.plugins.legend.display = false;
    opcoes.scales.x.ticks.callback = (valor) => formatarNumeroCompacto(valor);
    return opcoes;
}

function opcoesGraficoRosca() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
            legend: {
                position: "right",
                labels: { color: "#dbeafe", boxWidth: 12, padding: 14 }
            },
            tooltip: {
                callbacks: {
                    label: (contexto) =>
                        `${contexto.label}: ${formatarMoeda(contexto.raw)}`
                }
            }
        }
    };
}

