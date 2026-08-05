import { protegerModulo } from "../../../module-guard.js";

await protegerModulo("comex");

const state = {
  rows: [],
  filtered: [],
  sourceName: "",
  view: "entregas"
};

const $ = (selector) => document.querySelector(selector);
const els = {
  material: $("#materialFilter"),
  color: $("#colorFilter"),
  file: $("#fileInput"),
  rows: $("#deliveryRows"),
  empty: $("#emptyState"),
  totalMaterial: $("#totalMaterial"),
  totalInvoices: $("#totalInvoices"),
  nextArrival: $("#nextArrival"),
  nextArrivalPlace: $("#nextArrivalPlace"),
  nextDelivery: $("#nextDelivery"),
  tableTotal: $("#tableTotal"),
  summary: $("#resultSummary"),
  timeline: $("#timeline"),
  lastUpdate: $("#lastUpdate"),
  currentDate: $("#currentDate"),
  unitLabel: $("#unitLabel"),
  toast: $("#toast")
};

const VIEW_META = {
  dashboard: ["Dashboard COMEX", "Visão consolidada das operações de comércio exterior.", "fa-chart-pie"],
  entregas: ["Entregas por Material", "Acompanhe o detalhamento das importações por material em tempo real.", "fa-boxes-stacked"],
  containers: ["Containers", "Controle de containers, armadores, free time e devoluções.", "fa-box"],
  invoices: ["Invoices", "Gestão e conferência das invoices de importação.", "fa-file-invoice"],
  embarques: ["Embarques", "Acompanhamento de embarques marítimos e aéreos.", "fa-ship"],
  fornecedores: ["Fornecedores", "Cadastro e desempenho dos fornecedores internacionais.", "fa-building"],
  documentos: ["Documentos", "Central de documentos e arquivos das operações.", "fa-folder-open"],
  historico: ["Histórico", "Registro das importações e alterações realizadas.", "fa-clock-rotate-left"],
  relatorios: ["Relatórios", "Indicadores e relatórios gerenciais do COMEX.", "fa-chart-column"]
};

const ALIASES = {
  material: ["material", "descricao material", "descrição material", "produto", "item", "descricao", "descrição"],
  color: ["cor", "color", "colour"],
  invoice: ["invoice", "n invoice", "nº invoice", "numero invoice", "número invoice", "fatura"],
  supplier: ["fornecedor", "supplier", "fabricante"],
  qty: ["qtd", "quantidade", "qty", "quantity", "quantidade mts", "qtd mts", "saldo"],
  unit: ["unidade", "und", "unit", "um", "u.m."],
  arrival: ["chegada porto aeroporto", "chegada porto / aeroporto", "chegada porto", "chegada aeroporto", "data chegada", "eta"],
  place: ["porto aeroporto", "porto / aeroporto", "porto", "aeroporto", "local chegada", "destino"],
  delivery: ["previsao entrega na smart", "previsão entrega na smart", "previsao entrega", "previsão entrega", "entrega smart", "data entrega"],
  status: ["status", "situacao", "situação"],
  origin: ["origem", "origin", "pais origem", "país origem"],
  order: ["n pedido", "nº pedido", "numero pedido", "número pedido", "pedido", "oc"]
};

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function findColumn(headers, aliases) {
  const normalized = headers.map(normalizeText);
  for (const alias of aliases.map(normalizeText)) {
    const exact = normalized.indexOf(alias);
    if (exact >= 0) return headers[exact];
  }
  for (let i = 0; i < normalized.length; i++) {
    if (aliases.map(normalizeText).some(alias => normalized[i].includes(alias))) return headers[i];
  }
  return null;
}

function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  let text = String(value ?? "").trim().replace(/\s/g, "");
  if (!text) return 0;
  if (text.includes(",") && text.includes(".")) {
    text = text.lastIndexOf(",") > text.lastIndexOf(".")
      ? text.replace(/\./g, "").replace(",", ".")
      : text.replace(/,/g, "");
  } else if (text.includes(",")) {
    text = text.replace(/\./g, "").replace(",", ".");
  }
  return Number(text.replace(/[^\d.-]/g, "")) || 0;
}

function excelDateToDate(value) {
  if (!value && value !== 0) return null;
  if (value instanceof Date && !isNaN(value)) return value;
  if (typeof value === "number" && window.XLSX?.SSF) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  const text = String(value).trim();
  const br = text.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (br) {
    let year = Number(br[3]); if (year < 100) year += 2000;
    const d = new Date(year, Number(br[2]) - 1, Number(br[1]));
    return isNaN(d) ? null : d;
  }
  const d = new Date(text);
  return isNaN(d) ? null : d;
}

function formatDate(date) {
  return date ? new Intl.DateTimeFormat("pt-BR").format(date) : "—";
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(value || 0);
}

function statusInfo(raw, delivery) {
  const value = normalizeText(raw);
  if (value.includes("atras")) return ["Atrasado", "status-atrasado"];
  if (value.includes("trans")) return ["Em Trânsito", "status-transito"];
  if (value.includes("program")) return ["Programado", "status-programado"];
  if (value.includes("prev")) return ["Previsto", "status-previsto"];
  if (delivery && delivery < startOfToday()) return ["Atrasado", "status-atrasado"];
  return ["Previsto", "status-previsto"];
}

function startOfToday() {
  const d = new Date(); d.setHours(0,0,0,0); return d;
}

function mapRows(rawRows) {
  if (!rawRows.length) return [];
  const headers = Object.keys(rawRows.find(row => Object.keys(row).length) || {});
  const cols = {};
  Object.entries(ALIASES).forEach(([key, aliases]) => cols[key] = findColumn(headers, aliases));

  const required = ["material", "invoice", "qty"];
  const missing = required.filter(key => !cols[key]);
  if (missing.length) {
    throw new Error("Não encontrei as colunas obrigatórias: Material, Invoice e Quantidade.");
  }

  return rawRows.map((row, index) => ({
    id: index + 1,
    material: String(row[cols.material] ?? "").trim(),
    color: String(cols.color ? row[cols.color] ?? "" : "").trim(),
    invoice: String(row[cols.invoice] ?? "").trim(),
    supplier: String(cols.supplier ? row[cols.supplier] ?? "" : "").trim(),
    qty: parseNumber(row[cols.qty]),
    unit: String(cols.unit ? row[cols.unit] ?? "MTS" : "MTS").trim() || "MTS",
    arrival: excelDateToDate(cols.arrival ? row[cols.arrival] : null),
    place: String(cols.place ? row[cols.place] ?? "" : "").trim(),
    delivery: excelDateToDate(cols.delivery ? row[cols.delivery] : null),
    status: String(cols.status ? row[cols.status] ?? "" : "").trim(),
    origin: String(cols.origin ? row[cols.origin] ?? "" : "").trim(),
    order: String(cols.order ? row[cols.order] ?? "" : "").trim()
  })).filter(row => row.material || row.invoice || row.qty);
}

async function readFile(file) {
  if (!window.XLSX) throw new Error("Biblioteca de leitura do Excel não carregada.");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("A planilha não possui uma aba válida.");
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });
  return mapRows(raw);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a,b) => a.localeCompare(b, "pt-BR"));
}

function populateFilters() {
  const selectedMaterial = els.material.value;
  els.material.innerHTML = `<option value="">Todos os materiais</option>` +
    uniqueSorted(state.rows.map(r => r.material)).map(v => `<option>${escapeHtml(v)}</option>`).join("");
  if ([...els.material.options].some(o => o.value === selectedMaterial)) els.material.value = selectedMaterial;
  updateColorOptions();
}

function updateColorOptions() {
  const selectedColor = els.color.value;
  const material = els.material.value;
  const colors = uniqueSorted(state.rows.filter(r => !material || r.material === material).map(r => r.color));
  els.color.innerHTML = `<option value="">Todas as cores</option>` +
    colors.map(v => `<option>${escapeHtml(v)}</option>`).join("");
  if (colors.includes(selectedColor)) els.color.value = selectedColor;
}

function applyFilters() {
  const material = els.material.value;
  const color = els.color.value;
  state.filtered = state.rows.filter(row =>
    (!material || row.material === material) &&
    (!color || row.color === color)
  );
  render();
}

function render() {
  const rows = state.filtered;
  const total = rows.reduce((sum, row) => sum + row.qty, 0);
  const invoices = new Set(rows.map(r => r.invoice).filter(Boolean));
  const arrivals = rows.filter(r => r.arrival).sort((a,b) => a.arrival - b.arrival);
  const deliveries = rows.filter(r => r.delivery).sort((a,b) => a.delivery - b.delivery);
  const units = uniqueSorted(rows.map(r => r.unit));

  els.totalMaterial.textContent = `${formatNumber(total)}${units.length === 1 ? " " + units[0] : ""}`;
  els.unitLabel.textContent = units.length > 1 ? `Unidades: ${units.join(", ")}` : "Quantidade consolidada";
  els.totalInvoices.textContent = invoices.size;
  els.nextArrival.textContent = arrivals.length ? formatDate(arrivals[0].arrival) : "—";
  els.nextArrivalPlace.textContent = arrivals[0]?.place || "Sem previsão";
  els.nextDelivery.textContent = deliveries.length ? formatDate(deliveries[0].delivery) : "—";
  els.tableTotal.textContent = formatNumber(total);
  els.summary.textContent = rows.length
    ? `${rows.length} registro(s) · ${invoices.size} invoice(s)${state.sourceName ? " · " + state.sourceName : ""}`
    : "Nenhum registro encontrado";

  els.rows.innerHTML = rows.map(row => {
    const [status, css] = statusInfo(row.status, row.delivery);
    return `<tr>
      <td>${escapeHtml(row.invoice || "—")}</td>
      <td>${escapeHtml(row.supplier || "—")}</td>
      <td>${formatNumber(row.qty)} ${escapeHtml(row.unit)}</td>
      <td>${formatDate(row.arrival)}${row.place ? `<br><small>${escapeHtml(row.place)}</small>` : ""}</td>
      <td>${formatDate(row.delivery)}</td>
      <td><span class="status ${css}">${status}</span></td>
      <td>${escapeHtml(row.origin || "—")}</td>
      <td>${escapeHtml(row.order || "—")}</td>
    </tr>`;
  }).join("");

  els.empty.classList.toggle("hide", rows.length > 0);
  renderTimeline(rows);
}

function renderTimeline(rows) {
  const events = [];
  rows.forEach(row => {
    if (row.arrival) events.push({ date: row.arrival, title: "Chegada prevista", detail: row.place || row.invoice });
    if (row.delivery) events.push({ date: row.delivery, title: "Entrega na Smart", detail: row.invoice });
  });
  events.sort((a,b) => a.date - b.date);
  const unique = [];
  const seen = new Set();
  for (const event of events) {
    const key = `${event.date.toISOString().slice(0,10)}|${event.title}|${event.detail}`;
    if (!seen.has(key)) { seen.add(key); unique.push(event); }
    if (unique.length === 6) break;
  }
  els.timeline.innerHTML = unique.length ? unique.map(event => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <strong>${formatDate(event.date)}</strong>
      <span>${escapeHtml(event.title)}<br>${escapeHtml(event.detail || "")}</span>
    </div>`).join("") :
    `<div class="empty-state" style="width:100%;min-height:120px"><p>As principais datas aparecerão aqui.</p></div>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[ch]));
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 3500);
}

function saveLocal() {
  try {
    const serializable = state.rows.map(r => ({
      ...r,
      arrival: r.arrival?.toISOString() || null,
      delivery: r.delivery?.toISOString() || null
    }));
    localStorage.setItem("smart-comex-deliveries", JSON.stringify({ rows: serializable, sourceName: state.sourceName, updatedAt: new Date().toISOString() }));
  } catch (error) {
    console.warn("Não foi possível salvar a importação localmente.", error);
  }
}

function restoreLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem("smart-comex-deliveries") || "null");
    if (!saved?.rows?.length) return;
    state.rows = saved.rows.map(r => ({ ...r, arrival: r.arrival ? new Date(r.arrival) : null, delivery: r.delivery ? new Date(r.delivery) : null }));
    state.sourceName = saved.sourceName || "";
    els.lastUpdate.textContent = `Dados atualizados em ${formatDate(new Date(saved.updatedAt))}`;
    populateFilters();
    applyFilters();
  } catch (error) {
    console.warn("Importação local inválida.", error);
  }
}

function exportFiltered() {
  if (!state.filtered.length) return showToast("Não há dados para exportar.");
  const data = state.filtered.map(row => ({
    Material: row.material, Cor: row.color, Invoice: row.invoice, Fornecedor: row.supplier,
    Quantidade: row.qty, Unidade: row.unit, "Chegada Porto / Aeroporto": formatDate(row.arrival),
    "Porto / Aeroporto": row.place, "Previsão Entrega na Smart": formatDate(row.delivery),
    Status: statusInfo(row.status, row.delivery)[0], Origem: row.origin, "Nº Pedido": row.order
  }));
  const sheet = XLSX.utils.json_to_sheet(data);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Entregas");
  XLSX.writeFile(book, "COMEX_Entregas_por_Material.xlsx");
}

function openView(view) {
  state.view = view;
  document.querySelectorAll(".comex-nav button").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  const [title, subtitle, icon] = VIEW_META[view];
  $("#pageTitle").textContent = title;
  $("#pageSubtitle").textContent = subtitle;
  $("#entregasView").classList.toggle("active", view === "entregas");
  $("#placeholderView").classList.toggle("active", view !== "entregas");
  if (view !== "entregas") {
    $("#placeholderTitle").textContent = title;
    $("#placeholderText").textContent = `${subtitle} A estrutura desta área já está criada e pode ser implementada por etapas.`;
    $("#placeholderIcon").className = `fa-solid ${icon}`;
  }
}

document.querySelectorAll(".comex-nav button").forEach(btn => btn.addEventListener("click", () => openView(btn.dataset.view)));
els.material.addEventListener("change", () => { updateColorOptions(); applyFilters(); });
els.color.addEventListener("change", applyFilters);
$("#clearFilters").addEventListener("click", () => { els.material.value = ""; updateColorOptions(); els.color.value = ""; applyFilters(); });
$("#exportButton").addEventListener("click", exportFiltered);
els.file.addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    els.lastUpdate.textContent = "Processando documento...";
    const rows = await readFile(file);
    state.rows = rows;
    state.sourceName = file.name;
    populateFilters();
    applyFilters();
    saveLocal();
    els.lastUpdate.textContent = `Dados atualizados agora · ${rows.length} registros`;
    showToast(`Documento importado com sucesso: ${rows.length} registros.`);
  } catch (error) {
    console.error(error);
    els.lastUpdate.textContent = "Falha ao processar documento";
    showToast(error.message || "Não foi possível ler o documento.");
  } finally {
    event.target.value = "";
  }
});

const upload = document.querySelector(".upload-card");
["dragenter","dragover"].forEach(type => upload.addEventListener(type, e => { e.preventDefault(); upload.style.borderColor = "#7fc0ff"; }));
["dragleave","drop"].forEach(type => upload.addEventListener(type, e => { e.preventDefault(); upload.style.borderColor = ""; }));
upload.addEventListener("drop", e => {
  const file = e.dataTransfer.files?.[0];
  if (!file) return;
  const dt = new DataTransfer(); dt.items.add(file); els.file.files = dt.files; els.file.dispatchEvent(new Event("change"));
});

els.currentDate.textContent = formatDate(new Date());
render();
restoreLocal();
