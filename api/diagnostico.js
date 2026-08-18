import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `Eres un consultor de transformación digital en un stand del taller CCLAM Lambayeque, durante la feria por la visita del Papa León XIV a Chiclayo (octubre 2026). Un dueño de una MYPE de turismo, hostelería o comercio acaba de responder un diagnóstico de 9 preguntas de opción múltiple sobre su negocio: actividad principal, si tiene una oferta definida para los visitantes del evento, su capacidad operativa, en qué canales digitales aparece, si su información está actualizada, qué puede hacer hoy un cliente por internet (conocer, consultar precio, reservar, pagar...), cómo registra y da seguimiento a sus consultas/pedidos, y si podría atender un pico de consultas.

Escribe dos cosas en la misma respuesta:

1. Un diagnóstico corto, directo y persuasivo en español, con tono cercano y peruano, sin tecnicismos, para mostrar de inmediato en pantalla. Debe mostrarle EXACTAMENTE qué oportunidades de venta está perdiendo hoy — cruzando varias de sus respuestas, no solo una — y qué podría ganar si lo resuelve antes de la llegada de miles de turistas.

2. El contenido de texto para un informe PDF descargable más completo (el puntaje y las tablas los calcula el propio sistema, tú NO inventes números): fortalezas, brechas y hasta 4 prioridades de acción con su checklist, plazo sugerido y resultado esperado.

Después de mostrarle lo que está perdiendo, cierra el diagnóstico corto con una
nota de ánimo real ("recomendacion"): que sienta que esto se resuelve rápido y
que no tiene que hacerlo solo ni a mano — con el acompañamiento correcto se
ordena en poco tiempo. No sugieras tareas manuales/caseras que él tendría que
hacer por su cuenta. Que conecte con las ganas de recibir el informe completo,
sin sonar a venta forzada y sin nombrar un producto o servicio específico.

Reglas estrictas:
- Nunca menciones precios, tarifas, planes, costos ni cifras en soles o dólares.
- Sé específico sobre SU actividad y SUS respuestas, no genérico. Prioriza las brechas más graves (sin presencia digital, información desactualizada, sin forma de vender/reservar/pagar online, sin registro de consultas, sin capacidad de atender un pico de demanda).
- Las prioridades del PDF deben estar ordenadas de la más urgente a la menos urgente, y cada "items" debe ser una lista concreta de puntos a revisar o implementar (no frases largas).
- No inventes puntajes, porcentajes ni tablas numéricas: eso lo calcula el sistema aparte.
- El objetivo del diagnóstico corto es generar tanto interés que la persona quiera descargar el informe completo.
- Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin bloques de código.

Formato exacto (respeta las claves):
{"gancho": "frase corta e impactante, máximo 12 palabras", "parrafo": "2 a 3 frases en tono personal mencionando su actividad y la oportunidad del evento", "oportunidades": ["3 a 4 oportunidades concretas que está perdiendo, cada una una frase corta, sin precios"], "recomendacion": "1 a 2 frases de ánimo genuino: esto se resuelve rápido y no tiene que hacerlo solo, sin tareas manuales ni mención de precios o productos", "fortalezas": ["3 a 5 frases cortas de lo que el negocio ya tiene bien, según sus respuestas"], "brechas": ["3 a 6 frases cortas de las brechas principales detectadas"], "prioridades": [{"titulo": "nombre corto de la prioridad, ej. Actualizar tu presencia digital", "accion": "1 frase de la acción recomendada", "items": ["3 a 8 puntos concretos a revisar o implementar"], "plazo": "ej. 7 días", "resultado": "1 frase del resultado esperado"}]}`;

const SINGLE_QUESTIONS = {
  actividad: new Set([
    "Alojamiento",
    "Restaurantes y alimentación",
    "Cafeterías, juguerías y consumo rápido",
    "Transporte y movilidad",
    "Agencias y servicios turísticos",
    "Recreación, cultura y experiencias",
    "Artesanía y productos locales",
    "Comercio y servicios al visitante",
    "Otro",
  ]),
  oferta: new Set([
    "Sí, ya está definido",
    "Tengo una idea, pero debo desarrollarla",
    "Todavía no lo he evaluado",
    "No aplica a mi negocio",
  ]),
  capacidad: new Set([
    "Sí, sin cambios importantes",
    "Sí, pero necesitaría personal o proveedores",
    "Sí, pero necesitaría mejorar procesos o tecnología",
    "No, actualmente estoy al límite",
    "No lo he evaluado",
  ]),
  infoActualizada: new Set([
    "Sí, completamente",
    "Parcialmente",
    "No",
    "No lo sé",
    "No tengo presencia digital",
  ]),
  registro: new Set([
    "Sistema comercial, CRM o sistema de reservas",
    "Excel o Google Sheets",
    "Agenda o cuaderno",
    "Todo queda en WhatsApp",
    "No realizo un registro",
  ]),
  atencionConsultas: new Set([
    "Sí, tengo un proceso definido",
    "Sí, pero de manera manual",
    "Tendría dificultades",
    "Necesitaría una herramienta o sistema",
    "No lo he evaluado",
  ]),
};

const MULTI_QUESTIONS = {
  canales: new Set([
    "Página web",
    "Google Maps",
    "Facebook o Instagram",
    "WhatsApp Business",
    "Plataforma de reservas o ventas",
    "Ninguno",
  ]),
  accionesCliente: new Set([
    "Conocer mis productos o servicios",
    "Consultar precios",
    "Comunicarse por WhatsApp",
    "Reservar o realizar un pedido",
    "Pagar",
    "Solamente puede ver información",
    "Ninguna",
  ]),
  necesidades: new Set([
    "Diseñar una oferta para visitantes",
    "Mejorar mi presencia en Google e internet",
    "Crear o mejorar mi página web",
    "Implementar catálogo, QR o reservas",
    "Organizar consultas y seguimiento comercial",
    "Implementar un sistema comercial o CRM",
    "Mejorar capacidad, personal o abastecimiento",
    "Promoción y publicidad",
    "Medios de pago",
    "Alianzas con otras empresas",
    "Otro",
  ]),
};

const QUESTION_LABELS = {
  actividad: "Actividad principal",
  oferta: "Oferta definida para visitantes",
  capacidad: "Capacidad operativa ante más clientes",
  canales: "Canales digitales donde aparece",
  infoActualizada: "Información actualizada en internet",
  accionesCliente: "Qué puede hacer un cliente por internet",
  registro: "Registro y seguimiento comercial",
  atencionConsultas: "Capacidad de atender un pico de consultas",
  necesidades: "Necesidades de apoyo señaladas",
};

function isValidBody(body) {
  if (!body || typeof body !== "object") return false;

  for (const key of Object.keys(SINGLE_QUESTIONS)) {
    if (typeof body[key] !== "string" || !SINGLE_QUESTIONS[key].has(body[key])) return false;
  }

  for (const key of Object.keys(MULTI_QUESTIONS)) {
    const value = body[key];
    if (!Array.isArray(value) || value.length === 0) return false;
    if (!value.every((v) => typeof v === "string" && MULTI_QUESTIONS[key].has(v))) return false;
  }

  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};

  if (!isValidBody(body)) {
    res.status(400).json({ error: "Respuestas del diagnóstico inválidas o incompletas" });
    return;
  }

  const userMessage = [
    ...Object.keys(SINGLE_QUESTIONS).map((key) => `${QUESTION_LABELS[key]}: ${body[key]}`),
    ...Object.keys(MULTI_QUESTIONS).map((key) => `${QUESTION_LABELS[key]}: ${body[key].join(", ")}`),
  ].join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 2048,
      output_config: { effort: "medium" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) throw new Error("Respuesta sin bloque de texto");

    const raw = textBlock.text.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
    const parsed = JSON.parse(raw);

    const prioridadValida = (p) =>
      p &&
      typeof p.titulo === "string" &&
      typeof p.accion === "string" &&
      Array.isArray(p.items) &&
      p.items.every((i) => typeof i === "string") &&
      typeof p.plazo === "string" &&
      typeof p.resultado === "string";

    if (
      typeof parsed.gancho !== "string" ||
      typeof parsed.parrafo !== "string" ||
      !Array.isArray(parsed.oportunidades) ||
      typeof parsed.recomendacion !== "string" ||
      !Array.isArray(parsed.fortalezas) ||
      !Array.isArray(parsed.brechas) ||
      !Array.isArray(parsed.prioridades) ||
      parsed.prioridades.length === 0 ||
      !parsed.prioridades.every(prioridadValida)
    ) {
      throw new Error("Formato de respuesta inesperado");
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error("diagnostico error:", err);
    res.status(500).json({ error: "No se pudo generar el diagnóstico con IA" });
  }
}
