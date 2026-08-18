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

const INSIGHT_RULES = [
  {
    check: (a) => a.canales.length === 0 || a.canales.includes("Ninguno"),
    text: "Tu negocio no aparece en ningún canal digital: el turista que te busca en Google o Maps simplemente no te encuentra y elige a la competencia.",
  },
  {
    check: (a) =>
      a.infoActualizada === "No" ||
      a.infoActualizada === "No lo sé" ||
      a.infoActualizada === "No tengo presencia digital",
    text: "Tu dirección, horario o fotos desactualizadas hacen que un visitante llegue a la hora equivocada o directamente no vaya, aunque ya te haya encontrado.",
  },
  {
    check: (a) =>
      a.accionesCliente.length === 0 ||
      a.accionesCliente.includes("Ninguna") ||
      (a.accionesCliente.length === 1 && a.accionesCliente.includes("Solamente puede ver información")),
    text: "Hoy un cliente solo puede mirar: no puede reservar, pedir ni pagar por internet, así que esa venta depende de que te llame o te encuentre en persona.",
  },
  {
    check: (a) => a.registro === "Todo queda en WhatsApp" || a.registro === "No realizo un registro",
    text: "Sin un registro ordenado de consultas y pedidos, varias ventas se pierden entre mensajes de WhatsApp que nadie vuelve a revisar.",
  },
  {
    check: (a) =>
      a.atencionConsultas === "Tendría dificultades" ||
      a.atencionConsultas === "Necesitaría una herramienta o sistema" ||
      a.atencionConsultas === "No lo he evaluado",
    text: "Si te llegan muchas consultas a la vez durante el evento, hoy no tienes cómo responderlas a todas a tiempo — y cada una sin responder es una venta que se enfría.",
  },
  {
    check: (a) => a.capacidad === "No, actualmente estoy al límite" || a.capacidad === "No lo he evaluado",
    text: "Con más clientes de los que puedes atender hoy, corres el riesgo de decepcionar justo a los visitantes que llegaron una sola vez a Chiclayo.",
  },
  {
    check: (a) => a.oferta === "Todavía no lo he evaluado" || a.oferta === "Tengo una idea, pero debo desarrollarla",
    text: "Todavía no tienes lista una oferta pensada para el visitante del evento, así que puedes estar dejando pasar la demanda extra sin capturarla.",
  },
];

function fallbackDiagnostico(answers) {
  const oportunidades = INSIGHT_RULES.filter((r) => r.check(answers))
    .map((r) => r.text)
    .slice(0, 4);

  if (oportunidades.length === 0) {
    oportunidades.push(
      "Tu negocio ya tiene varias bases digitales cubiertas: el siguiente paso es afinar los detalles para no perder ni una venta durante el evento."
    );
  }

  return {
    gancho: "Estás dejando ventas sobre la mesa",
    parrafo: `Como negocio de ${(answers.actividad || "tu rubro").toLowerCase()}, ${
      BUSINESS_CONTEXT[answers.actividad] || BUSINESS_CONTEXT["Otro"]
    }`,
    oportunidades,
    recomendacion:
      "La buena noticia: esto se ordena rápido y no tienes que resolverlo solo. Con el acompañamiento correcto, en poco tiempo puedes llegar a la visita del Papa con tu negocio listo para vender más.",
  };
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
      !diagnostico.recomendacion
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
