"use strict";

/*
==========================================================
SMART GROUP ANALYTICS
Gráficos da Visão Geral Financeira
==========================================================
*/

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


/* ======================================================
   FLUXO DE CAIXA
   Recebimentos, pagamentos e saldo por mês
   ====================================================== */

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

    const valoresRecebidos = chaves.map(
        (chave) => mapaRecebimentos.get(chave) || 0
    );

    const valoresPagos = chaves.map(
        (chave) => mapaPagamentos.get(chave) || 0
    );

    const valoresSaldo = chaves.map(
        (_, indice) => valoresRecebidos[indice] - valoresPagos[indice]
    );

    criarOuAtualizarGrafico(
        "fluxoCaixa",
        "graficoFluxoCaixa",
        {
            type: "line",

            data: {
                labels: chaves.map(formatarChaveMes),

                datasets: [
                    {
                        label: "Recebimentos",
                        data: valoresRecebidos,
                        borderColor: "#27d17f",
                        backgroundColor: "rgba(39, 209, 127, 0.12)",
                        pointBackgroundColor: "#27d17f",
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        borderWidth: 2,
                        tension: 0.32,
                        fill: true
                    },
                    {
                        label: "Pagamentos",
                        data: valoresPagos,
                        borderColor: "#ff665c",
                        backgroundColor: "rgba(255, 102, 92, 0.08)",
                        pointBackgroundColor: "#ff665c",
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        borderWidth: 2,
                        tension: 0.32,
                        fill: false
                    },
                    {
                        label: "Saldo",
                        data: valoresSaldo,
                        borderColor: "#52a3ff",
                        backgroundColor: "rgba(82, 163, 255, 0.08)",
                        pointBackgroundColor: "#52a3ff",
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        borderWidth: 2,
                        borderDash: [7, 5],
                        tension: 0.32,
                        fill: false
                    }
                ]
            },

            options: opcoesGraficoCartesiano()
        }
    );
}


/* ======================================================
   RECEBIMENTOS POR DIA
   ====================================================== */

function renderizarRecebimentosDia(recebimentos) {
    const mapa = agruparPor(
        recebimentos.filter((item) => item.dataPagamento),
        (item) => formatarDataISO(item.dataPagamento),
        "valorLiquidoPago"
    );

    const chaves = [...mapa.keys()].sort();

    const opcoes = opcoesGraficoCartesiano();

    opcoes.plugins.legend.display = false;

    opcoes.scales.x.ticks = {
        color: "#9fb7d5",
        autoSkip: true,
        maxTicksLimit: 12,
        maxRotation: 0,
        minRotation: 0
    };

    criarOuAtualizarGrafico(
        "recebimentosDia",
        "graficoRecebimentosDia",
        {
            type: "bar",

            data: {
                labels: chaves.map((chave) =>
                    formatarDataCurta(
                        new Date(`${chave}T00:00:00`)
                    )
                ),

                datasets: [
                    {
                        label: "Valor recebido",
                        data: chaves.map(
                            (chave) => mapa.get(chave)
                        ),
                        backgroundColor: "#1683ff",
                        hoverBackgroundColor: "#52a3ff",
                        borderRadius: 6,
                        borderSkipped: false,
                        maxBarThickness: 24
                    }
                ]
            },

            options: opcoes
        }
    );
}


/* ======================================================
   TOP 10 CLIENTES
   ====================================================== */

function renderizarTopClientes(recebimentos) {
    const mapa = agruparPor(
        recebimentos,
        (item) => item.razaoSocial || "Não informado",
        "valorLiquidoPago"
    );

    const ranking = ordenarMapa(mapa)
        .slice(0, 10)
        .reverse();

    criarOuAtualizarGrafico(
        "topClientes",
        "graficoTopClientes",
        {
            type: "bar",

            data: {
                labels: ranking.map(
                    ([nome]) => abreviarTexto(nome, 30)
                ),

                datasets: [
                    {
                        label: "Recebido",
                        data: ranking.map(
                            ([, valor]) => valor
                        ),
                        backgroundColor: "#27d17f",
                        hoverBackgroundColor: "#52e59e",
                        borderRadius: 6,
                        borderSkipped: false,
                        maxBarThickness: 22
                    }
                ]
            },

            options: opcoesGraficoHorizontal()
        }
    );
}


/* ======================================================
   RECEBIMENTOS POR BANCO
   ====================================================== */

function renderizarRecebimentosBanco(recebimentos) {
    const validos = recebimentos.filter(
        (item) =>
            normalizarTexto(item.banco) !== "nao informado"
    );

    const mapa = agruparPor(
        validos,
        (item) => nomeBancoAmigavel(item.banco),
        "valorLiquidoPago"
    );

    const ranking = ordenarMapa(mapa).slice(0, 8);

    criarOuAtualizarGrafico(
        "recebimentosBanco",
        "graficoRecebimentosBanco",
        {
            type: "doughnut",

            data: {
                labels: ranking.map(([nome]) => nome),

                datasets: [
                    {
                        data: ranking.map(
                            ([, valor]) => valor
                        ),

                        backgroundColor: [
                            "#1683ff",
                            "#27d17f",
                            "#ff9f43",
                            "#8f61e8",
                            "#31c6d4",
                            "#f15bb5",
                            "#a0aec0",
                            "#f6d000"
                        ],

                        borderWidth: 0,
                        hoverOffset: 7
                    }
                ]
            },

            options: opcoesGraficoRosca(
                "Recebimentos"
            ),

            plugins: [
                pluginTextoCentralRosca(
                    "Total recebido"
                )
            ]
        }
    );
}


/* ======================================================
   RECEBIMENTOS POR PLANO FINANCEIRO
   ====================================================== */

function renderizarPlanoFinanceiro(recebimentos) {
    const mapa = agruparPor(
        recebimentos,
        (item) =>
            item.planoFinanceiro ||
            item.historicoFinanceiro ||
            "Não informado",
        "valorLiquidoPago"
    );

    const ranking = ordenarMapa(mapa)
        .slice(0, 8)
        .reverse();

    criarOuAtualizarGrafico(
        "planoFinanceiro",
        "graficoPlanoFinanceiro",
        {
            type: "bar",

            data: {
                labels: ranking.map(
                    ([nome]) => abreviarTexto(nome, 27)
                ),

                datasets: [
                    {
                        label: "Recebido",
                        data: ranking.map(
                            ([, valor]) => valor
                        ),
                        backgroundColor: "#8f61e8",
                        hoverBackgroundColor: "#aa84ef",
                        borderRadius: 6,
                        borderSkipped: false,
                        maxBarThickness: 22
                    }
                ]
            },

            options: opcoesGraficoHorizontal()
        }
    );
}


/* ======================================================
   REPRESENTANTES
   ====================================================== */

function renderizarRepresentantes(recebimentos) {
    const mapa = agruparPor(
        recebimentos,
        (item) =>
            item.representante ||
            item.codigoRepresentante ||
            "Não informado",
        "valorLiquidoPago"
    );

    const ranking = ordenarMapa(mapa)
        .slice(0, 10)
        .reverse();

    criarOuAtualizarGrafico(
        "representantes",
        "graficoRepresentantes",
        {
            type: "bar",

            data: {
                labels: ranking.map(
                    ([nome]) => abreviarTexto(nome, 24)
                ),

                datasets: [
                    {
                        label: "Recebido",
                        data: ranking.map(
                            ([, valor]) => valor
                        ),
                        backgroundColor: "#1683ff",
                        hoverBackgroundColor: "#52a3ff",
                        borderRadius: 6,
                        borderSkipped: false,
                        maxBarThickness: 22
                    }
                ]
            },

            options: opcoesGraficoHorizontal()
        }
    );
}


/* ======================================================
   SITUAÇÃO DAS CONTAS A RECEBER
   ====================================================== */

function renderizarSituacaoReceber(clientes) {
    const pago = somar(
        clientes.filter((item) => item.pago),
        "valorLiquidoPago"
    );

    const aberto = somar(
        clientes.filter(
            (item) => item.situacao === "aberto"
        ),
        "valorDocumento"
    );

    const atraso = somar(
        clientes.filter(
            (item) => item.situacao === "atrasado"
        ),
        "valorDocumento"
    );

    criarOuAtualizarGrafico(
        "situacaoReceber",
        "graficoSituacaoReceber",
        {
            type: "doughnut",

            data: {
                labels: [
                    "Pago",
                    "A receber",
                    "Em atraso"
                ],

                datasets: [
                    {
                        data: [
                            pago,
                            aberto,
                            atraso
                        ],

                        backgroundColor: [
                            "#27d17f",
                            "#1683ff",
                            "#ff4d4d"
                        ],

                        borderWidth: 0,
                        hoverOffset: 7
                    }
                ]
            },

            options: opcoesGraficoRosca(
                "Carteira"
            ),

            plugins: [
                pluginTextoCentralRosca(
                    "Total da carteira"
                )
            ]
        }
    );
}


/* ======================================================
   TABELA DE CONTAS EM ATRASO
   ====================================================== */

function renderizarTabelaAtrasos(dados) {
    const corpo =
        document.getElementById(
            "corpoTabelaAtrasos"
        );

    const contador =
        document.getElementById(
            "contadorAtrasos"
        );

    if (!corpo) {
        return;
    }

    const hoje =
        inicioDoDia(new Date());

    const atrasados = dados
        .filter(
            (item) =>
                item.tipoCadastro === "cliente" &&
                item.atrasado
        )
        .sort(
            (a, b) =>
                a.vencimento - b.vencimento
        );

    if (contador) {
        contador.textContent =
            String(atrasados.length);
    }

    if (!atrasados.length) {
        corpo.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="tabela-vazia"
                >
                    Nenhuma conta em atraso no período selecionado.
                </td>
            </tr>
        `;

        return;
    }

    corpo.innerHTML =
        atrasados
            .slice(0, 15)
            .map((item) => {
                const dias =
                    Math.max(
                        0,
                        Math.floor(
                            (
                                hoje -
                                inicioDoDia(
                                    item.vencimento
                                )
                            ) /
                            86400000
                        )
                    );

                return `
                    <tr>
                        <td
                            title="${escaparHtml(item.razaoSocial)}"
                        >
                            ${escaparHtml(
                                abreviarTexto(
                                    item.razaoSocial,
                                    38
                                )
                            )}
                        </td>

                        <td>
                            ${escaparHtml(
                                item.documento || "-"
                            )}
                        </td>

                        <td>
                            ${formatarDataBR(
                                item.vencimento
                            )}
                        </td>

                        <td>
                            <span class="dias-atraso">
                                ${dias}
                            </span>
                        </td>

                        <td class="valor-financeiro">
                            ${formatarMoeda(
                                item.valorDocumento
                            )}
                        </td>

                        <td class="banco-tabela">
                            ${escaparHtml(
                                nomeBancoAmigavel(
                                    item.banco
                                )
                            )}
                        </td>

                        <td class="representante-tabela">
                            ${escaparHtml(
                                item.representante
                            )}
                        </td>
                    </tr>
                `;
            })
            .join("");
}


/* ======================================================
   CRIAÇÃO E ATUALIZAÇÃO DOS GRÁFICOS
   ====================================================== */

function criarOuAtualizarGrafico(
    chave,
    canvasId,
    configuracao
) {
    const canvas =
        document.getElementById(canvasId);

    if (!canvas) {
        return;
    }

    if (graficosFinanceiros[chave]) {
        graficosFinanceiros[chave].destroy();
    }

    graficosFinanceiros[chave] =
        new Chart(
            canvas,
            configuracao
        );
}


/* ======================================================
   OPÇÕES COMUNS
   ====================================================== */

function opcoesGraficoCartesiano() {
    return {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
            mode: "index",
            intersect: false
        },

        plugins: {
            legend: {
                labels: {
                    color: "#dbeafe",
                    boxWidth: 12,
                    boxHeight: 12,
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: "rectRounded"
                }
            },

            tooltip: {
                padding: 11,
                backgroundColor:
                    "rgba(3, 18, 37, 0.96)",
                borderColor:
                    "rgba(82, 163, 255, 0.3)",
                borderWidth: 1,

                callbacks: {
                    label: (contexto) =>
                        `${contexto.dataset.label}: ` +
                        `${formatarMoeda(contexto.raw)}`
                }
            }
        },

        scales: {
            x: {
                ticks: {
                    color: "#9fb7d5",
                    maxRotation: 0
                },

                grid: {
                    color:
                        "rgba(255,255,255,0.04)"
                },

                border: {
                    color:
                        "rgba(255,255,255,0.08)"
                }
            },

            y: {
                beginAtZero: true,

                ticks: {
                    color: "#9fb7d5",

                    callback: (valor) =>
                        formatarNumeroCompacto(valor)
                },

                grid: {
                    color:
                        "rgba(255,255,255,0.06)"
                },

                border: {
                    color:
                        "rgba(255,255,255,0.08)"
                }
            }
        }
    };
}


/*
 * Correção importante:
 * em gráficos horizontais o eixo Y é categórico.
 * Sem esta alteração o Chart.js exibia 0, 1, 2, 3...
 * no lugar dos nomes dos clientes, planos e representantes.
 */
function opcoesGraficoHorizontal() {
    const opcoes =
        opcoesGraficoCartesiano();

    opcoes.indexAxis = "y";

    opcoes.plugins.legend.display = false;

    opcoes.scales.x.beginAtZero = true;

    opcoes.scales.x.ticks = {
        color: "#9fb7d5",

        callback: (valor) =>
            formatarNumeroCompacto(valor)
    };

    opcoes.scales.y.beginAtZero = false;

    opcoes.scales.y.ticks = {
        color: "#dbeafe",
        autoSkip: false,
        font: {
            size: 10,
            weight: "600"
        },

        callback: function(valor) {
            return this.getLabelForValue(valor);
        }
    };

    opcoes.scales.y.grid = {
        display: false
    };

    return opcoes;
}


function opcoesGraficoRosca(titulo) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "66%",

        plugins: {
            legend: {
                position: "right",

                labels: {
                    color: "#dbeafe",
                    boxWidth: 11,
                    boxHeight: 11,
                    padding: 15,

                    generateLabels: (grafico) => {
                        const dados =
                            grafico.data.datasets[0].data;

                        const total =
                            dados.reduce(
                                (soma, valor) =>
                                    soma + Number(valor || 0),
                                0
                            );

                        return grafico.data.labels.map(
                            (rotulo, indice) => {
                                const valor =
                                    Number(
                                        dados[indice] || 0
                                    );

                                const percentual =
                                    total
                                        ? (
                                            valor /
                                            total *
                                            100
                                        )
                                        : 0;

                                return {
                                    text:
                                        `${rotulo} ` +
                                        `${percentual.toLocaleString(
                                            "pt-BR",
                                            {
                                                minimumFractionDigits: 1,
                                                maximumFractionDigits: 1
                                            }
                                        )}%`,

                                    fillStyle:
                                        grafico.data.datasets[0]
                                            .backgroundColor[indice],

                                    strokeStyle:
                                        grafico.data.datasets[0]
                                            .backgroundColor[indice],

                                    lineWidth: 0,
                                    hidden: false,
                                    index: indice
                                };
                            }
                        );
                    }
                },

                onClick: (
                    evento,
                    item,
                    legenda
                ) => {
                    legenda.chart.toggleDataVisibility(
                        item.index
                    );

                    legenda.chart.update();
                }
            },

            title: {
                display: false,
                text: titulo
            },

            tooltip: {
                padding: 11,
                backgroundColor:
                    "rgba(3, 18, 37, 0.96)",
                borderColor:
                    "rgba(82, 163, 255, 0.3)",
                borderWidth: 1,

                callbacks: {
                    label: (contexto) => {
                        const valores =
                            contexto.dataset.data;

                        const total =
                            valores.reduce(
                                (soma, valor) =>
                                    soma +
                                    Number(valor || 0),
                                0
                            );

                        const valor =
                            Number(
                                contexto.raw || 0
                            );

                        const percentual =
                            total
                                ? valor /
                                    total *
                                    100
                                : 0;

                        return (
                            `${contexto.label}: ` +
                            `${formatarMoeda(valor)} ` +
                            `(${percentual.toLocaleString(
                                "pt-BR",
                                {
                                    minimumFractionDigits: 1,
                                    maximumFractionDigits: 1
                                }
                            )}%)`
                        );
                    }
                }
            }
        }
    };
}


/* ======================================================
   TEXTO CENTRAL DA ROSCA
   ====================================================== */

function pluginTextoCentralRosca(subtitulo) {
    return {
        id:
            `textoCentralRosca-${normalizarTexto(
                subtitulo
            ).replace(/\s+/g, "-")}`,

        afterDraw(grafico) {
            const contexto =
                grafico.ctx;

            const area =
                grafico.chartArea;

            if (!area) {
                return;
            }

            const valores =
                grafico.data.datasets[0].data;

            const total =
                valores.reduce(
                    (soma, valor) =>
                        soma +
                        Number(valor || 0),
                    0
                );

            const centroX =
                (
                    area.left +
                    area.right
                ) /
                2;

            const centroY =
                (
                    area.top +
                    area.bottom
                ) /
                2;

            contexto.save();

            contexto.textAlign = "center";
            contexto.textBaseline = "middle";

            contexto.fillStyle = "#ffffff";
            contexto.font =
                "700 15px Arial";

            contexto.fillText(
                formatarNumeroCompacto(total),
                centroX,
                centroY - 7
            );

            contexto.fillStyle = "#91abc9";
            contexto.font =
                "500 9px Arial";

            contexto.fillText(
                subtitulo,
                centroX,
                centroY + 12
            );

            contexto.restore();
        }
    };
}


/* ======================================================
   NOMES AMIGÁVEIS DOS BANCOS
   ====================================================== */

function nomeBancoAmigavel(nomeOriginal) {
    const nome =
        normalizarTexto(nomeOriginal);

    if (!nome || nome === "nao informado") {
        return "Não informado";
    }

    if (
        nome === "bb" ||
        nome.includes("banco do brasil")
    ) {
        return "Banco do Brasil";
    }

    if (nome.includes("itau")) {
        return "Itaú";
    }

    if (nome.includes("sicoob")) {
        return "Sicoob";
    }

    if (nome.includes("sicredi")) {
        return "Sicredi";
    }

    if (nome.includes("caixa")) {
        return "Caixa Econômica";
    }

    if (nome.includes("bradesco")) {
        return "Bradesco";
    }

    if (nome.includes("santander")) {
        return "Santander";
    }

    if (nome.includes("integra")) {
        return "Integra";
    }

    return String(nomeOriginal || "Não informado")
        .trim();
}
