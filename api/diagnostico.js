import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `Eres un consultor de transformación digital en un stand del taller CCLAM Lambayeque, durante la feria por la visita del Papa León XIV a Chiclayo (octubre 2026). Un dueño de una MYPE acaba de responder qué tipo de negocio tiene y qué problemas digitales enfrenta.

Escribe un diagnóstico breve, directo y persuasivo en español, con tono cercano y peruano, sin tecnicismos. Debe mostrarle EXACTAMENTE qué oportunidades de venta está perdiendo hoy y qué podría ganar si lo resuelve antes de la llegada de miles de turistas.

Reglas estrictas:
- Nunca menciones precios, tarifas, planes, costos ni cifras en soles o dólares.
- Sé específico sobre SU tipo de negocio y SUS problemas seleccionados, no genérico.
- El objetivo es generar tanto interés que la persona quiera dejar su correo para recibir el informe completo.
- Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin bloques de código.

Formato exacto (respeta las claves):
{"gancho": "frase corta e impactante, máximo 12 palabras", "parrafo": "2 a 3 frases en tono personal mencionando su tipo de negocio y la oportunidad del evento", "oportunidades": ["3 a 4 oportunidades concretas que está perdiendo, cada una una frase corta, sin precios"]}`;

const VALID_BUSINESS_TYPES = new Set([
  "Comercio / tienda",
  "Servicios profesionales",
  "Restaurante / food",
  "Producción / manufactura",
  "Inmobiliaria / construcción",
  "Otro negocio",
]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { tipoNegocio, problemas } = req.body || {};

  if (
    typeof tipoNegocio !== "string" ||
    !VALID_BUSINESS_TYPES.has(tipoNegocio) ||
    !Array.isArray(problemas) ||
    problemas.length === 0 ||
    !problemas.every((p) => typeof p === "string")
  ) {
    res.status(400).json({ error: "tipoNegocio y problemas son requeridos" });
    return;
  }

  const userMessage = `Tipo de negocio: ${tipoNegocio}\nProblemas digitales seleccionados: ${problemas.join(", ")}`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      output_config: { effort: "medium" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) throw new Error("Respuesta sin bloque de texto");

    const raw = textBlock.text.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
    const parsed = JSON.parse(raw);

    if (
      typeof parsed.gancho !== "string" ||
      typeof parsed.parrafo !== "string" ||
      !Array.isArray(parsed.oportunidades)
    ) {
      throw new Error("Formato de respuesta inesperado");
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error("diagnostico error:", err);
    res.status(500).json({ error: "No se pudo generar el diagnóstico con IA" });
  }
}
