import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// ---------- Contenido de respaldo (si la IA falla o no hay API key) ----------
const PROBLEM_INSIGHTS = {
  "No tengo web ni presencia online":
    "Tu cliente te busca en Google y encuentra a la competencia: un turista o vecino que busca tu rubro simplemente no te encuentra.",
  "Pierdo clientes que no regresan":
    "El cliente te ve, le gusta, lo piensa y se pierde entre cientos de negocios. Sin forma de recontactarlo, esa venta futura se queda en el camino.",
  "No llevo control de mis ventas":
    "Estás vendiendo a ciegas: no saber qué vendiste, qué te queda o cuál es tu producto estrella te impide tomar decisiones.",
  "No sé qué tengo en stock":
    "Riesgo de quedarte sin lo que más se vende justo en los días de mayor demanda, o de comprar de más lo que no rota.",
  "No emito comprobantes electrónicos":
    "Desde 2026 la facturación electrónica deja de ser opcional para más MYPEs. No tenerla lista a tiempo puede traerte problemas normativos.",
  "Gestiono todo por WhatsApp sin orden":
    "Pedidos y clientes se pierden en el chat: se mezclan conversaciones, se olvidan seguimientos y se pierde tiempo cada semana.",
  "Mi equipo no tiene herramientas":
    "Tu equipo pierde horas en tareas manuales que podrían tomar minutos con las herramientas correctas.",
  "No tengo data ni reportes":
    "Decides a ciegas: sin reportes no sabes qué producto o servicio realmente te da más ganancia.",
};

const BUSINESS_CONTEXT = {
  "Comercio / tienda":
    "con miles de turistas caminando por Chiclayo, tu tienda puede captar clientes nuevos que hoy pasan de largo por no saber que existes.",
  "Servicios profesionales":
    "cada vez más personas buscan servicios profesionales recomendados en internet antes de llamar. Si no te encuentran ahí, pierdes la primera impresión.",
  "Restaurante / food":
    "los turistas eligen dónde comer buscando en Google Maps minutos antes de llegar. Un restaurante sin presencia digital pierde esas mesas.",
  "Producción / manufactura":
    "la demanda extra del evento es una oportunidad para vender más volumen, pero sin control de stock y ventas es difícil responder a tiempo.",
  "Inmobiliaria / construcción":
    "la visita del Papa puede traer más movimiento e interés en la zona. Sin seguimiento ordenado de contactos, esas oportunidades se enfrían.",
  "Otro negocio":
    "la ola de visitantes que trae este evento es una oportunidad puntual, y aprovecharla depende de qué tan lista está la parte digital de tu negocio.",
};

function fallbackDiagnostico(tipoNegocio, problemas) {
  return {
    gancho: "Estás dejando ventas sobre la mesa",
    parrafo: `Como negocio de ${tipoNegocio.toLowerCase()}, ${BUSINESS_CONTEXT[tipoNegocio] || "hay una oportunidad puntual en este evento que depende de qué tan lista está la parte digital de tu negocio."}`,
    oportunidades: [...problemas]
      .slice(0, 4)
      .map((p) => PROBLEM_INSIGHTS[p] || p),
  };
}

// ---------- Estado ----------
const state = {
  step: 1,
  tipoNegocio: null,
  problemas: new Set(),
};

// ---------- Navegación ----------
const screenLanding = document.getElementById("screen-landing");
const screenWizard = document.getElementById("screen-wizard");
const panels = {
  1: document.getElementById("panel-1"),
  2: document.getElementById("panel-2"),
  3: document.getElementById("panel-3"),
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

// ---------- Paso 1: tipo de negocio ----------
const businessGrid = document.getElementById("business-grid");
const btnTo2 = document.getElementById("btn-to-2");

businessGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".option-card");
  if (!card) return;
  [...businessGrid.children].forEach((c) => c.classList.remove("selected"));
  card.classList.add("selected");
  state.tipoNegocio = card.dataset.value;
  btnTo2.disabled = false;
});

btnTo2.addEventListener("click", () => goToStep(2));

// ---------- Paso 2: problemas digitales ----------
const problemsGrid = document.getElementById("problems-grid");
const btnTo3 = document.getElementById("btn-to-3");
const btnTo1 = document.getElementById("btn-to-1");

problemsGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".option-card");
  if (!card) return;
  const value = card.dataset.value;
  if (state.problemas.has(value)) {
    state.problemas.delete(value);
    card.classList.remove("selected");
  } else {
    state.problemas.add(value);
    card.classList.add("selected");
  }
  btnTo3.disabled = state.problemas.size === 0;
});

btnTo1.addEventListener("click", () => goToStep(1));
btnTo3.addEventListener("click", () => {
  goToStep(3);
  loadDiagnostico();
});

// ---------- Paso 3: diagnóstico generado con IA ----------
const aiLoading = document.getElementById("ai-loading");
const aiResult = document.getElementById("ai-result");
let currentDiagnostico = null;

async function loadDiagnostico() {
  aiLoading.classList.remove("hidden");
  aiResult.classList.add("hidden");

  const problemasArr = [...state.problemas];
  let diagnostico;

  try {
    const res = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoNegocio: state.tipoNegocio, problemas: problemasArr }),
    });
    if (!res.ok) throw new Error("api error");
    diagnostico = await res.json();
    if (!diagnostico.gancho || !diagnostico.parrafo || !Array.isArray(diagnostico.oportunidades)) {
      throw new Error("formato inesperado");
    }
  } catch (err) {
    console.warn("Diagnóstico IA no disponible, usando respaldo:", err);
    diagnostico = fallbackDiagnostico(state.tipoNegocio, problemasArr);
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
}

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
  const email = document.getElementById("f-email").value.trim();
  const telefono = document.getElementById("f-telefono").value.trim();

  if (!email && !telefono) {
    leadError.textContent = "Déjanos al menos tu correo o tu WhatsApp para poder enviarte el informe.";
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

  const lead = {
    nombre: nombre || null,
    negocio: negocio || null,
    email: email || null,
    telefono: telefono || null,
    tipo_negocio: state.tipoNegocio,
    problemas: [...state.problemas],
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
