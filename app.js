import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// ---------- Contenido del diagnóstico (sin precios) ----------
const PROBLEM_INSIGHTS = {
  "No tengo web ni presencia online": {
    titulo: "Tu cliente te busca en Google y encuentra a la competencia",
    detalle:
      "Sin presencia digital, un turista o vecino que busca tu rubro en Google o Google Maps simplemente no te encuentra. Estás fuera del radar justo cuando más gente nueva llega a Chiclayo.",
  },
  "Pierdo clientes que no regresan": {
    titulo: "Se van y no hay forma de recontactarlos",
    detalle:
      "El cliente te ve, le gusta, lo piensa y se pierde entre cientos de negocios. Sin un canal para recontactarlo (WhatsApp, web, QR), esa venta futura se queda en el camino.",
  },
  "No llevo control de mis ventas": {
    titulo: "Estás vendiendo a ciegas",
    detalle:
      "No saber qué vendiste, qué te queda o cuál es tu producto estrella te impide tomar decisiones. Cada día sin ese control es una oportunidad de mejora que se pierde.",
  },
  "No sé qué tengo en stock": {
    titulo: "Riesgo de quedarte sin lo que más se vende",
    detalle:
      "Sin control de inventario, corres el riesgo de quedarte sin stock de tu producto más pedido justo en los días de mayor demanda, o de comprar de más lo que no rota.",
  },
  "No emito comprobantes electrónicos": {
    titulo: "Un tema normativo que ya no es opcional",
    detalle:
      "Desde 2026 la facturación electrónica deja de ser opcional para más MYPEs. No tenerla lista a tiempo puede generarte multas y problemas con tus proveedores y clientes formales.",
  },
  "Gestiono todo por WhatsApp sin orden": {
    titulo: "Pedidos y clientes se pierden en el chat",
    detalle:
      "WhatsApp es un gran canal de venta, pero sin un sistema detrás, los pedidos se mezclan, se olvidan seguimientos y pierdes tiempo buscando conversaciones antiguas.",
  },
  "Mi equipo no tiene herramientas": {
    titulo: "Tu equipo pierde horas en tareas manuales",
    detalle:
      "Sin herramientas digitales básicas, tareas que podrían tomar minutos (registrar una venta, responder un pedido, armar un reporte) le toman horas a tu equipo cada semana.",
  },
  "No tengo data ni reportes": {
    titulo: "Decisiones a ciegas, sin datos reales",
    detalle:
      "Sin reportes ni data de tu negocio, decides por intuición. No sabes qué producto o servicio realmente te da más ganancia, ni en qué días vendes más.",
  },
};

const BUSINESS_CONTEXT = {
  "Comercio / tienda":
    "Con miles de turistas caminando por Chiclayo, tu tienda puede captar clientes nuevos que hoy pasan de largo por no saber que existes.",
  "Servicios profesionales":
    "Cada vez más personas buscan servicios profesionales recomendados en internet antes de llamar. Si no te encuentran ahí, pierdes la primera impresión.",
  "Restaurante / food":
    "Los turistas eligen dónde comer buscando en Google Maps y redes sociales minutos antes de llegar. Un restaurante sin presencia digital pierde esas mesas.",
  "Producción / manufactura":
    "La demanda extra del evento es una oportunidad para vender más volumen, pero sin control de stock y ventas es difícil responder a tiempo.",
  "Inmobiliaria / construcción":
    "La visita del Papa puede traer más movimiento e interés en la zona. Sin presencia digital y seguimiento ordenado de contactos, esas oportunidades se enfrían.",
  "Otro negocio":
    "La ola de visitantes que trae este evento es una oportunidad puntual. Aprovecharla depende de qué tan lista está la parte digital de tu negocio.",
};

// ---------- Estado ----------
const state = {
  step: 1,
  tipoNegocio: null,
  problemas: new Set(),
};

// ---------- Helpers de navegación ----------
const screenLanding = document.getElementById("screen-landing");
const screenWizard = document.getElementById("screen-wizard");
const panels = {
  1: document.getElementById("panel-1"),
  2: document.getElementById("panel-2"),
  3: document.getElementById("panel-3"),
  4: document.getElementById("panel-4"),
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
btnTo3.addEventListener("click", () => goToStep(3));
document.getElementById("btn-to-2b").addEventListener("click", () => goToStep(2));

// ---------- Paso 3: formulario de contacto ----------
const form = document.getElementById("lead-form");
const formError = document.getElementById("form-error");
const btnSubmit = document.getElementById("btn-submit");

function fieldErr(id, msg) {
  const field = document.getElementById(id).closest(".field");
  field.querySelector(".err").textContent = msg || "";
}

function validateForm() {
  let ok = true;
  const nombre = document.getElementById("f-nombre").value.trim();
  const email = document.getElementById("f-email").value.trim();
  const telefono = document.getElementById("f-telefono").value.trim();
  const consent = document.getElementById("f-consent").checked;

  fieldErr("f-nombre", "");
  fieldErr("f-email", "");
  fieldErr("f-telefono", "");

  if (!nombre) { fieldErr("f-nombre", "Ingresa tu nombre"); ok = false; }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) { fieldErr("f-email", "Ingresa un correo válido"); ok = false; }

  const phoneDigits = telefono.replace(/\D/g, "");
  if (phoneDigits.length < 7) { fieldErr("f-telefono", "Ingresa un número válido"); ok = false; }

  if (!consent) { ok = false; }

  return ok;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.classList.add("hidden");

  if (!validateForm()) return;
  if (!state.tipoNegocio || state.problemas.size === 0) {
    formError.textContent = "Falta completar los pasos anteriores.";
    formError.classList.remove("hidden");
    return;
  }

  const lead = {
    nombre: document.getElementById("f-nombre").value.trim(),
    negocio: document.getElementById("f-negocio").value.trim() || null,
    email: document.getElementById("f-email").value.trim(),
    telefono: document.getElementById("f-telefono").value.trim(),
    tipo_negocio: state.tipoNegocio,
    problemas: [...state.problemas],
    nivel_digitalizacion: computeLevel(state.problemas.size),
    fuente: "evento_papa_leon_xiv_2026",
  };

  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<span class="spinner"></span>Enviando…';

  try {
    const { error } = await supabase.from("leads").insert(lead);
    if (error) throw error;
    renderResult();
    goToStep(4);
  } catch (err) {
    console.error(err);
    formError.textContent =
      "No pudimos guardar tus datos. Revisa tu conexión e inténtalo de nuevo.";
    formError.classList.remove("hidden");
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Ver mi diagnóstico →";
  }
});

// ---------- Paso 4: resultado ----------
function computeLevel(count) {
  if (count >= 6) return "Inicial";
  if (count >= 3) return "Básico";
  return "Intermedio";
}

const LEVEL_COPY = {
  Inicial: {
    label: "Nivel de digitalización: Inicial",
    desc: "Tu negocio todavía depende casi por completo de procesos manuales. Es el momento con más margen de mejora antes de la llegada de turistas.",
  },
  Básico: {
    label: "Nivel de digitalización: Básico",
    desc: "Ya tienes algunas bases, pero hay brechas importantes que te están haciendo perder ventas y clientes que no vuelven.",
  },
  Intermedio: {
    label: "Nivel de digitalización: Intermedio",
    desc: "Vas por buen camino. Cerrando estos últimos puntos puedes aprovechar mucho mejor la demanda extra que trae el evento.",
  },
};

function renderResult() {
  const level = computeLevel(state.problemas.size);
  const levelInfo = LEVEL_COPY[level];
  const contexto = BUSINESS_CONTEXT[state.tipoNegocio] || "";

  const gapsHtml = [...state.problemas]
    .map((p) => {
      const info = PROBLEM_INSIGHTS[p];
      if (!info) return "";
      return `
        <div class="gap-item">
          <div class="g-title">${info.titulo}</div>
          <div class="g-desc">${info.detalle}</div>
        </div>`;
    })
    .join("");

  document.getElementById("result-content").innerHTML = `
    <div class="step-label">Resultado</div>
    <h3 class="step-title">Tu diagnóstico digital personalizado</h3>

    <div class="result-summary">
      <div class="level-label">${levelInfo.label}</div>
      <h3>${state.tipoNegocio}</h3>
      <p>${levelInfo.desc} ${contexto}</p>
    </div>

    <div class="gap-list">
      ${gapsHtml}
    </div>

    <div class="next-steps">
      <h4>¡Listo! Ya registramos tu diagnóstico 🎉</h4>
      <p>
        Un asesor de IDE Solution se pondrá en contacto contigo por WhatsApp o
        correo para conversar sobre un plan a la medida de tu negocio, antes
        de la llegada de los turistas por la visita del Papa León XIV.
      </p>
    </div>
  `;
}
