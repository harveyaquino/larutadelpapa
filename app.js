import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// ---------- Contenido de respaldo (si la IA falla o no hay API key) ----------
const BUSINESS_CONTEXT = {
  "Alojamiento":
    "con miles de turistas buscando dónde hospedarse, tu propiedad puede llenarse si aparece donde ellos buscan primero: Google y plataformas de reservas.",
  "Restaurantes y alimentación":
    "los turistas eligen dónde comer buscando en Google Maps minutos antes de llegar. Un restaurante sin presencia digital pierde esas mesas.",
  "Cafeterías, juguerías y consumo rápido":
    "el flujo de visitantes caminando por el centro busca opciones rápidas desde el celular; si no apareces ahí, elige a la competencia de la cuadra siguiente.",
  "Transporte y movilidad":
    "miles de visitantes necesitarán movilizarse por Chiclayo durante el evento; quien los ubique primero por WhatsApp o reservas online se queda con el viaje.",
  "Agencias y servicios turísticos":
    "los turistas arman su itinerario buscando tours y experiencias en internet antes de llegar. Sin presencia digital ordenada, ese paquete lo vende otra agencia.",
  "Recreación, cultura y experiencias":
    "la ola de visitantes busca qué hacer y a dónde ir directamente desde el celular; sin información clara y actualizada, tu experiencia queda fuera del plan.",
  "Artesanía y productos locales":
    "el turista compra recuerdos y productos locales guiado por lo que encuentra en Google Maps o redes sociales cerca de donde está parado.",
  "Comercio y servicios al visitante":
    "con miles de visitantes caminando por Chiclayo, tu negocio puede captar clientes nuevos que hoy pasan de largo por no saber que existes.",
  "Otro":
    "la ola de visitantes que trae este evento es una oportunidad puntual, y aprovecharla depende de qué tan lista está la parte digital de tu negocio.",
};

const PRIORITY_RULES = [
  {
    check: (a) =>
      a.canales.length === 0 ||
      a.canales.includes("Ninguno") ||
      ["No", "No lo sé", "No tengo presencia digital", "Parcialmente"].includes(a.infoActualizada),
    oportunidad:
      "Tu negocio no aparece o tiene información desactualizada en internet: el turista que te busca no te encuentra o llega a la hora equivocada.",
    titulo: "Actualizar tu presencia digital",
    accion:
      "Revisar y actualizar tu información en los canales donde ya apareces (o crearlos si todavía no tienes ninguno):",
    items: [
      "Dirección",
      "Horario",
      "Teléfono",
      "Ubicación en Google Maps",
      "Fotografías recientes",
      "Carta o catálogo",
      "Medios de pago",
      "Enlace directo a WhatsApp",
    ],
    plazo: "7 días",
    resultado: "Que un visitante te encuentre, conozca tu oferta y pueda escribirte sin dificultades.",
  },
  {
    check: (a) => a.oferta === "Todavía no lo he evaluado" || a.oferta === "Tengo una idea, pero debo desarrollarla",
    oportunidad:
      "Todavía no tienes lista una oferta pensada para el visitante del evento, así que puedes estar dejando pasar la demanda extra sin capturarla.",
    titulo: "Crear una oferta para los visitantes del evento",
    accion: "Diseñar un producto o paquete específico para la visita del Papa, definiendo:",
    items: [
      "Qué incluye",
      "Precio final",
      "Horario disponible",
      "Capacidad diaria",
      "Forma de reserva",
      "Condiciones para grupos",
    ],
    plazo: "10 días",
    resultado: "Contar con una oferta clara que puedas promocionar a los visitantes del evento.",
  },
  {
    check: (a) =>
      a.registro === "Todo queda en WhatsApp" ||
      a.registro === "No realizo un registro" ||
      a.accionesCliente.length === 0 ||
      a.accionesCliente.includes("Ninguna") ||
      (a.accionesCliente.length === 1 && a.accionesCliente.includes("Solamente puede ver información")),
    oportunidad:
      "Sin un registro ordenado de consultas y pedidos, varias ventas se pierden entre mensajes de WhatsApp que nadie vuelve a revisar.",
    titulo: "Organizar las consultas y reservas",
    accion: "Implementar un proceso inicial simple para no perder ninguna consulta:",
    items: [
      "WhatsApp Business",
      "Respuestas rápidas",
      "Mensaje automático de bienvenida",
      "Etiquetas: consulta, reserva pendiente, reserva confirmada, atención finalizada",
      "Formato sencillo en Excel o Google Sheets",
      "Responsable de revisar las consultas",
    ],
    plazo: "15 días",
    resultado: "Reducir las consultas perdidas y saber cuántas terminan en reservas o ventas.",
  },
  {
    check: (a) =>
      a.capacidad === "No, actualmente estoy al límite" ||
      a.capacidad === "No lo he evaluado" ||
      a.atencionConsultas === "Tendría dificultades" ||
      a.atencionConsultas === "Necesitaría una herramienta o sistema" ||
      a.atencionConsultas === "No lo he evaluado",
    oportunidad:
      "Si te llegan muchas consultas o clientes a la vez durante el evento, hoy no tienes cómo atenderlos a todos a tiempo — y cada uno sin atender es una venta que se enfría.",
    titulo: "Preparar la operación para más clientes",
    accion: "Antes de promocionar masivamente tu oferta, define:",
    items: [
      "Capacidad máxima de atención por horario",
      "Número de trabajadores necesarios",
      "Inventario o insumos mínimos",
      "Proveedor alternativo",
      "Procedimiento para reservas",
      "Responsable de resolver reclamos",
    ],
    plazo: "20 días",
    resultado: "Evitar prometer al visitante una atención que el negocio todavía no puede cumplir.",
  },
];

const FORTALEZA_RULES = [
  {
    check: (a) => a.canales.length > 0 && !a.canales.includes("Ninguno"),
    text: "Tu negocio ya aparece en al menos un canal digital, una base sobre la cual seguir construyendo.",
  },
  {
    check: (a) => a.infoActualizada === "Sí, completamente",
    text: "Tu información está completamente actualizada, lo que genera confianza inmediata en quien te encuentra.",
  },
  {
    check: (a) => a.oferta === "Sí, ya está definido",
    text: "Ya tienes definida una oferta pensada para los visitantes del evento.",
  },
  {
    check: (a) => a.registro === "Sistema comercial, CRM o sistema de reservas" || a.registro === "Excel o Google Sheets",
    text: "Ya llevas un registro ordenado de tus consultas, pedidos o reservas.",
  },
  {
    check: (a) => a.capacidad === "Sí, sin cambios importantes",
    text: "Tu negocio podría atender más clientes sin necesitar cambios importantes.",
  },
  {
    check: (a) => a.atencionConsultas === "Sí, tengo un proceso definido",
    text: "Ya tienes un proceso definido para atender picos de consultas.",
  },
];

function fallbackDiagnostico(answers) {
  const triggered = PRIORITY_RULES.filter((r) => r.check(answers));
  const oportunidades = triggered.map((r) => r.oportunidad).slice(0, 4);

  if (oportunidades.length === 0) {
    oportunidades.push(
      "Tu negocio ya tiene varias bases digitales cubiertas: el siguiente paso es afinar los detalles para no perder ni una venta durante el evento."
    );
  }

  const fortalezas = FORTALEZA_RULES.filter((r) => r.check(answers))
    .map((r) => r.text)
    .slice(0, 5);
  if (fortalezas.length === 0) {
    fortalezas.push("Completaste el diagnóstico, un primer paso para preparar tu negocio ante el evento.");
  }

  const prioridades = triggered.slice(0, 4).map(({ titulo, accion, items, plazo, resultado }) => ({
    titulo,
    accion,
    items,
    plazo,
    resultado,
  }));
  if (prioridades.length === 0) {
    prioridades.push({
      titulo: "Afinar los detalles",
      accion: "Revisar cada canal y proceso para asegurarte de no perder ninguna venta durante el evento:",
      items: ["Presencia digital", "Oferta para visitantes", "Registro de consultas", "Capacidad de atención"],
      plazo: "15 días",
      resultado: "Llegar a la visita del Papa con tu negocio listo para vender más.",
    });
  }

  return {
    gancho: "Estás dejando ventas sobre la mesa",
    parrafo: `Como negocio de ${(answers.actividad || "tu rubro").toLowerCase()}, ${
      BUSINESS_CONTEXT[answers.actividad] || BUSINESS_CONTEXT["Otro"]
    }`,
    oportunidades,
    recomendacion:
      "La buena noticia: esto se ordena rápido y no tienes que resolverlo solo. Con el acompañamiento correcto, en poco tiempo puedes llegar a la visita del Papa con tu negocio listo para vender más.",
    fortalezas,
    brechas: oportunidades,
    prioridades,
  };
}

// ---------- Rúbrica de puntaje (determinística, no depende de la IA) ----------
function computeScoring(answers) {
  const ofertaPuntos = { "Sí, ya está definido": 25, "Tengo una idea, pero debo desarrollarla": 15, "Todavía no lo he evaluado": 5, "No aplica a mi negocio": 25 }[answers.oferta] ?? 0;

  const canalesReales = answers.canales.filter((c) => c !== "Ninguno");
  const canalesPuntos = answers.canales.includes("Ninguno") ? 0 : Math.min(8, canalesReales.length * 2);
  const infoPuntos = { "Sí, completamente": 9, Parcialmente: 5, No: 2, "No lo sé": 1, "No tengo presencia digital": 0 }[answers.infoActualizada] ?? 0;
  const accionesReales = answers.accionesCliente.filter(
    (a) => a !== "Ninguna" && a !== "Solamente puede ver información"
  );
  const accionesPuntos = answers.accionesCliente.includes("Ninguna")
    ? 0
    : accionesReales.length === 0
    ? 1
    : Math.min(8, accionesReales.length * 2);
  const presenciaPuntos = canalesPuntos + infoPuntos + accionesPuntos;

  const registroPuntos =
    {
      "Sistema comercial, CRM o sistema de reservas": 13,
      "Excel o Google Sheets": 9,
      "Agenda o cuaderno": 5,
      "Todo queda en WhatsApp": 3,
      "No realizo un registro": 0,
    }[answers.registro] ?? 0;
  const atencionPuntos =
    {
      "Sí, tengo un proceso definido": 12,
      "Sí, pero de manera manual": 8,
      "Necesitaría una herramienta o sistema": 4,
      "Tendría dificultades": 2,
      "No lo he evaluado": 0,
    }[answers.atencionConsultas] ?? 0;
  const procesoPuntos = registroPuntos + atencionPuntos;

  const capacidadPuntos =
    {
      "Sí, sin cambios importantes": 25,
      "Sí, pero necesitaría mejorar procesos o tecnología": 18,
      "Sí, pero necesitaría personal o proveedores": 15,
      "No lo he evaluado": 8,
      "No, actualmente estoy al límite": 0,
    }[answers.capacidad] ?? 0;

  const etiqueta = (puntos) => (puntos >= 20 ? "Avanzado" : puntos >= 13 ? "Intermedio" : puntos >= 7 ? "En desarrollo" : "Requiere atención");

  const dimensiones = [
    { nombre: "Oferta para visitantes", puntos: ofertaPuntos, max: 25, etiqueta: etiqueta(ofertaPuntos) },
    { nombre: "Presencia digital", puntos: presenciaPuntos, max: 25, etiqueta: etiqueta(presenciaPuntos) },
    { nombre: "Proceso comercial", puntos: procesoPuntos, max: 25, etiqueta: etiqueta(procesoPuntos) },
    { nombre: "Capacidad operativa", puntos: capacidadPuntos, max: 25, etiqueta: etiqueta(capacidadPuntos) },
  ];

  const total = dimensiones.reduce((sum, d) => sum + d.puntos, 0);
  const nivel = total >= 76 ? "Avanzado" : total >= 56 ? "Intermedio" : total >= 31 ? "En preparación" : "Inicial";

  return { dimensiones, total, nivel };
}

function buildPlanAccion(prioridades) {
  return prioridades.map((p) => ({ accion: p.titulo, plazo: p.plazo, indicador: p.resultado }));
}

// ---------- Estado ----------
const QUESTION_CONFIG = {
  actividad: { type: "single" },
  oferta: { type: "single" },
  capacidad: { type: "single" },
  canales: { type: "multi" },
  infoActualizada: { type: "single" },
  accionesCliente: { type: "multi" },
  registro: { type: "single" },
  atencionConsultas: { type: "single" },
  necesidades: { type: "multi" },
};

const PANEL_QUESTIONS = {
  1: ["actividad", "oferta", "capacidad"],
  2: ["canales", "infoActualizada", "accionesCliente"],
  3: ["registro", "atencionConsultas"],
  4: ["necesidades"],
};

const NEXT_BUTTON_BY_PANEL = { 1: "btn-to-2", 2: "btn-to-3", 3: "btn-to-4", 4: "btn-to-5" };

const KEY_TO_PANEL = {};
Object.entries(PANEL_QUESTIONS).forEach(([panel, keys]) => {
  keys.forEach((key) => (KEY_TO_PANEL[key] = Number(panel)));
});

const state = {
  step: 1,
  answers: {
    actividad: null,
    oferta: null,
    capacidad: null,
    canales: new Set(),
    infoActualizada: null,
    accionesCliente: new Set(),
    registro: null,
    atencionConsultas: null,
    necesidades: new Set(),
  },
};

function serializeAnswers() {
  return {
    actividad: state.answers.actividad,
    oferta: state.answers.oferta,
    capacidad: state.answers.capacidad,
    canales: [...state.answers.canales],
    infoActualizada: state.answers.infoActualizada,
    accionesCliente: [...state.answers.accionesCliente],
    registro: state.answers.registro,
    atencionConsultas: state.answers.atencionConsultas,
    necesidades: [...state.answers.necesidades],
  };
}

// ---------- Navegación ----------
const screenLanding = document.getElementById("screen-landing");
const screenWizard = document.getElementById("screen-wizard");
const panels = {
  1: document.getElementById("panel-1"),
  2: document.getElementById("panel-2"),
  3: document.getElementById("panel-3"),
  4: document.getElementById("panel-4"),
  5: document.getElementById("panel-5"),
};
const stepDots = document.querySelectorAll(".step-dot");

function goToStep(n) {
  state.step = n;
  Object.entries(panels).forEach(([key, el]) => {
    el.classList.toggle("hidden", Number(key) !== n);
  });
  stepDots.forEach((dot) => {
    const dotStep = Number(dot.dataset.step);
    dot.classList.toggle("active", dotStep === n);
    dot.classList.toggle("done", dotStep < n);
  });
  window.scrollTo({ top: screenWizard.offsetTop - 10, behavior: "smooth" });
}

document.getElementById("btn-start").addEventListener("click", () => {
  screenLanding.classList.add("hidden");
  screenWizard.classList.remove("hidden");
  goToStep(1);
});

// ---------- Preguntas de opción única / múltiple ----------
function isAnswered(key) {
  const value = state.answers[key];
  return value instanceof Set ? value.size > 0 : value !== null;
}

function updateNextButton(panel) {
  const btn = document.getElementById(NEXT_BUTTON_BY_PANEL[panel]);
  if (!btn) return;
  btn.disabled = !PANEL_QUESTIONS[panel].every(isAnswered);
}

function updateMultiDisabledState(grid, key) {
  const max = grid.dataset.max ? Number(grid.dataset.max) : null;
  if (!max) return;
  const set = state.answers[key];
  const atMax = set.size >= max;
  [...grid.children].forEach((card) => {
    if (!set.has(card.dataset.value)) {
      card.classList.toggle("disabled", atMax);
    }
  });
}

function handleSingleSelect(grid, key, card, value) {
  [...grid.children].forEach((c) => c.classList.remove("selected"));
  card.classList.add("selected");
  state.answers[key] = value;
}

function handleMultiSelect(grid, key, card, value) {
  const set = state.answers[key];
  const exclusive = grid.dataset.exclusive;

  if (set.has(value)) {
    set.delete(value);
    card.classList.remove("selected");
  } else {
    if (exclusive && value === exclusive) {
      set.clear();
      [...grid.children].forEach((c) => c.classList.remove("selected"));
    } else if (exclusive && set.has(exclusive)) {
      set.delete(exclusive);
      const exCard = [...grid.children].find((c) => c.dataset.value === exclusive);
      if (exCard) exCard.classList.remove("selected");
    }
    set.add(value);
    card.classList.add("selected");
  }
  updateMultiDisabledState(grid, key);
}

document.querySelectorAll(".option-grid[data-question]").forEach((grid) => {
  const key = grid.dataset.question;
  const config = QUESTION_CONFIG[key];

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".option-card");
    if (!card || card.classList.contains("disabled")) return;
    const value = card.dataset.value;

    if (config.type === "single") {
      handleSingleSelect(grid, key, card, value);
    } else {
      handleMultiSelect(grid, key, card, value);
    }

    updateNextButton(KEY_TO_PANEL[key]);
  });
});

document.getElementById("btn-to-2").addEventListener("click", () => goToStep(2));
document.getElementById("btn-to-1").addEventListener("click", () => goToStep(1));
document.getElementById("btn-to-3").addEventListener("click", () => goToStep(3));
document.getElementById("btn-to-2b").addEventListener("click", () => goToStep(2));
document.getElementById("btn-to-4").addEventListener("click", () => goToStep(4));
document.getElementById("btn-to-3b").addEventListener("click", () => goToStep(3));
document.getElementById("btn-to-5").addEventListener("click", () => {
  goToStep(5);
  loadDiagnostico();
});

// ---------- Paso 5: diagnóstico generado con IA ----------
const aiLoading = document.getElementById("ai-loading");
const aiResult = document.getElementById("ai-result");
let currentDiagnostico = null;

async function loadDiagnostico() {
  aiLoading.classList.remove("hidden");
  aiResult.classList.add("hidden");

  const answers = serializeAnswers();
  let diagnostico;

  try {
    const res = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    if (!res.ok) throw new Error("api error");
    diagnostico = await res.json();
    if (
      !diagnostico.gancho ||
      !diagnostico.parrafo ||
      !Array.isArray(diagnostico.oportunidades) ||
      !diagnostico.recomendacion ||
      !Array.isArray(diagnostico.fortalezas) ||
      !Array.isArray(diagnostico.brechas) ||
      !Array.isArray(diagnostico.prioridades) ||
      diagnostico.prioridades.length === 0
    ) {
      throw new Error("formato inesperado");
    }
  } catch (err) {
    console.warn("Diagnóstico IA no disponible, usando respaldo:", err);
    diagnostico = fallbackDiagnostico(answers);
  }

  currentDiagnostico = diagnostico;
  renderDiagnostico(diagnostico);

  aiLoading.classList.add("hidden");
  aiResult.classList.remove("hidden");
}

function renderDiagnostico(diagnostico) {
  document.getElementById("res-gancho").textContent = diagnostico.gancho;
  document.getElementById("res-parrafo").textContent = diagnostico.parrafo;

  const list = document.getElementById("res-oportunidades");
  list.innerHTML = diagnostico.oportunidades
    .map((o) => `<div class="gap-item">${o}</div>`)
    .join("");

  document.getElementById("res-recomendacion").textContent = diagnostico.recomendacion;
}

// ---------- Descarga del diagnóstico completo en PDF (solo en el navegador) ----------
const btnDownloadPdf = document.getElementById("btn-download-pdf");
const pdfError = document.getElementById("pdf-error");

async function downloadDiagnosticoPdf() {
  if (!currentDiagnostico) return;

  pdfError.classList.add("hidden");
  const originalLabel = btnDownloadPdf.textContent;
  btnDownloadPdf.disabled = true;
  btnDownloadPdf.textContent = "Generando PDF…";

  try {
    const { jsPDF } = await import("https://esm.sh/jspdf@2.5.2");
    const answers = serializeAnswers();
    const scoring = computeScoring(answers);
    const planAccion = buildPlanAccion(currentDiagnostico.prioridades || []);

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    function ensureSpace(h) {
      if (y + h > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    }
    function heading(text, size) {
      ensureSpace(size * 1.6);
      doc.setFont(undefined, "bold");
      doc.setFontSize(size);
      doc.text(text, margin, y);
      y += size * 1.4;
      doc.setFont(undefined, "normal");
    }
    function paragraph(text, size = 10) {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, contentWidth);
      lines.forEach((line) => {
        ensureSpace(14);
        doc.text(line, margin, y);
        y += 14;
      });
    }
    function bullets(items, size = 10) {
      doc.setFontSize(size);
      items.forEach((item) => {
        const lines = doc.splitTextToSize(`•  ${item}`, contentWidth);
        lines.forEach((line) => {
          ensureSpace(14);
          doc.text(line, margin, y);
          y += 14;
        });
      });
    }
    function table(headers, rows, colWidths) {
      const lineHeight = 12;
      ensureSpace(lineHeight + 10);
      doc.setFont(undefined, "bold");
      doc.setFontSize(9);
      let x = margin;
      headers.forEach((h, i) => {
        doc.text(h, x, y);
        x += colWidths[i];
      });
      y += lineHeight;
      doc.setDrawColor(200);
      doc.line(margin, y, margin + colWidths.reduce((a, b) => a + b, 0), y);
      y += 8;
      doc.setFont(undefined, "normal");
      rows.forEach((row) => {
        const cellLines = row.map((cell, i) => doc.splitTextToSize(String(cell), colWidths[i] - 6));
        const maxLines = Math.max(...cellLines.map((l) => l.length));
        ensureSpace(maxLines * lineHeight + 10);
        let cx = margin;
        cellLines.forEach((lines, i) => {
          lines.forEach((line, li) => doc.text(line, cx, y + li * lineHeight));
          cx += colWidths[i];
        });
        y += maxLines * lineHeight + 10;
      });
    }

    doc.setFont(undefined, "bold");
    doc.setFontSize(16);
    doc.text("Diagnóstico Digital MYPE", margin, y);
    y += 20;
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Taller CCLAM Lambayeque · Visita del Papa León XIV, Chiclayo 2026", margin, y);
    y += 14;
    doc.text(
      `Actividad: ${answers.actividad || "-"}   ·   Generado: ${new Date().toLocaleDateString("es-PE")}`,
      margin,
      y
    );
    doc.setTextColor(0);
    y += 26;

    heading(`Resultado general: ${scoring.total} de 100 puntos`, 13);
    paragraph(`Nivel: ${scoring.nivel}`);
    y += 4;
    paragraph(currentDiagnostico.parrafo);
    y += 10;

    heading("Resultado por dimensión", 12);
    table(
      ["Dimensión", "Puntaje", "Resultado"],
      scoring.dimensiones.map((d) => [d.nombre, `${d.puntos}/${d.max}`, d.etiqueta]),
      [230, 90, contentWidth - 320]
    );
    y += 6;

    heading("Fortalezas identificadas", 12);
    bullets(currentDiagnostico.fortalezas);
    y += 6;

    heading("Principales brechas", 12);
    bullets(currentDiagnostico.brechas);
    y += 6;

    heading("Recomendaciones personalizadas", 13);
    currentDiagnostico.prioridades.forEach((p, i) => {
      heading(`Prioridad ${i + 1}: ${p.titulo}`, 11);
      paragraph(p.accion);
      bullets(p.items || []);
      y += 2;
      paragraph(`Plazo sugerido: ${p.plazo}`);
      paragraph(`Resultado esperado: ${p.resultado}`);
      y += 8;
    });

    heading("Plan de acción resumido", 12);
    table(
      ["Acción", "Plazo", "Indicador"],
      planAccion.map((r) => [r.accion, r.plazo, r.indicador]),
      [170, 70, contentWidth - 240]
    );

    y += 12;
    doc.setTextColor(140);
    paragraph(
      "Generado automáticamente por IDE Solution × CCLAM Lambayeque. No reemplaza una asesoría profesional.",
      8
    );
    doc.setTextColor(0);

    const slug = (answers.actividad || "negocio").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    doc.save(`diagnostico-digital-mype-${slug}.pdf`);
  } catch (err) {
    console.error("No se pudo generar el PDF:", err);
    pdfError.textContent = "No pudimos generar el PDF. Intenta de nuevo en unos segundos.";
    pdfError.classList.remove("hidden");
  } finally {
    btnDownloadPdf.disabled = false;
    btnDownloadPdf.textContent = originalLabel;
  }
}

btnDownloadPdf.addEventListener("click", downloadDiagnosticoPdf);

// ---------- Formulario de contacto (opcional) ----------
const leadForm = document.getElementById("lead-form");
const leadError = document.getElementById("lead-error");
const leadBoxForm = leadForm;
const leadSuccess = document.getElementById("lead-success");
const btnSubmit = document.getElementById("btn-submit");

leadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  leadError.classList.add("hidden");

  const nombre = document.getElementById("f-nombre").value.trim();
  const negocio = document.getElementById("f-negocio").value.trim();
  const distrito = document.getElementById("f-distrito").value.trim();
  const email = document.getElementById("f-email").value.trim();
  const telefono = document.getElementById("f-telefono").value.trim();
  const autorizacion = leadForm.querySelector('input[name="f-autorizacion"]:checked').value;

  if (autorizacion === "whatsapp" && !telefono) {
    leadError.textContent = "Déjanos tu WhatsApp para poder enviarte el informe.";
    leadError.classList.remove("hidden");
    return;
  }
  if (autorizacion === "email" && !email) {
    leadError.textContent = "Déjanos tu correo para poder enviarte el informe.";
    leadError.classList.remove("hidden");
    return;
  }

  if (email) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      leadError.textContent = "Ingresa un correo válido.";
      leadError.classList.remove("hidden");
      return;
    }
  }

  const answers = serializeAnswers();
  const lead = {
    nombre: nombre || null,
    negocio: negocio || null,
    distrito: distrito || null,
    email: email || null,
    telefono: telefono || null,
    autorizacion,
    actividad_principal: answers.actividad,
    oferta_visitantes: answers.oferta,
    capacidad_operativa: answers.capacidad,
    canales_digitales: answers.canales,
    info_actualizada: answers.infoActualizada,
    acciones_cliente: answers.accionesCliente,
    registro_comercial: answers.registro,
    capacidad_consultas: answers.atencionConsultas,
    necesidades: answers.necesidades,
    diagnostico_ia: currentDiagnostico,
    fuente: "evento_papa_leon_xiv_2026",
  };

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<span class="spinner"></span>Enviando…';

  try {
    const { error } = await supabase.from("leads").insert(lead);
    if (error) throw error;
    leadBoxForm.classList.add("hidden");
    leadSuccess.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    leadError.textContent = "No pudimos guardar tus datos. Revisa tu conexión e inténtalo de nuevo.";
    leadError.classList.remove("hidden");
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Enviarme el informe completo →";
  }
});
