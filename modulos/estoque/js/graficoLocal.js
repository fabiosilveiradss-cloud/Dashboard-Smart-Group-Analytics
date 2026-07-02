window.localSelecionado = null;

let chartLocal = null;

function atualizarGraficoLocal(dados){

    const resumo = {};

    dados.forEach(item=>{

        const local = item["Nome do Local de Estoque"] || "SEM LOCAL";
        const qtd = Number(item["Qtd.fisica"]) || 0;

        resumo[local] = (resumo[local] || 0) + qtd;

    });

    const labels = Object.keys(resumo);
    const valores = Object.values(resumo);

    const ctx = document.getElementById("graficoLocais");

    if(chartLocal){
        chartLocal.destroy();
    }

    chartLocal = new Chart(ctx, {
        type:"pie",
        data:{
            labels:labels,
            datasets:[{
                data:valores,
                backgroundColor:[
                    "#2563eb",
                    "#8b5cf6",
                    "#f97316",
                    "#22c55e",
                    "#ef4444",
                    "#06b6d4"
                ],
                borderWidth:0
            }]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{
                    position:"bottom",
                    labels:{
                        color:"white"
                    }
                },
                tooltip:{
                    callbacks:{
                        label:function(context){
                            return context.label + ": " + formatarNumero(context.raw) + " M";
                        }
                    }
                }
            },
            onClick:function(event, elements){

                if(elements.length === 0) return;

                const index = elements[0].index;
                const local = labels[index];

                window.localSelecionado = local;

                aplicarFiltrosTabela();

                atualizarGraficoFamilia(
                    dadosFiltrados.filter(item =>
                        item["Nome do Local de Estoque"] === local
                    )
                );

            }
        }
    });

}
