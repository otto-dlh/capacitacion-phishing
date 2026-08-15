import Anthropic from "@anthropic-ai/sdk";

/* ============================================================
   Proxy del Analizador con IA.
   La API key vive aquí (variable de entorno de Netlify), nunca
   en el navegador. El frontend solo manda el texto sospechoso.
   ============================================================ */

const MAX_CHARS = 6000;

const SYSTEM = `Eres un analista de ciberseguridad que ayuda a colaboradores de pymes en Guatemala a evaluar mensajes sospechosos (correo, SMS o WhatsApp).

Analiza el mensaje que te entrega la persona y considera señales típicas de fraude: dominios falsos o parecidos a los oficiales (la SAT es sat.gob.gt, los bancos guatemaltecos usan .com.gt), urgencia artificial, enlaces acortados, solicitud de credenciales, códigos o pagos, cambios de cuenta bancaria de un proveedor, y pedidos de secretismo (fraude del CEO / BEC).

No inventes datos que no estén en el mensaje. Si el mensaje no aporta suficiente información para decidir, usa el veredicto "sospechoso" y dilo en la recomendación.

Escribe en español de Guatemala, dirigiéndote a la persona de usted. Cada señal debe ser concreta y corta (una línea), citando lo que viste en el mensaje. La recomendación son una o dos oraciones con la acción concreta que debe tomar.`;

const SCHEMA = {
  type: "object",
  properties: {
    veredicto: {
      type: "string",
      enum: ["phishing", "sospechoso", "legitimo"],
      description: "Veredicto general sobre el mensaje analizado.",
    },
    confianza: {
      type: "integer",
      description: "Qué tan seguro está del veredicto, de 0 a 100.",
    },
    senales: {
      type: "array",
      items: { type: "string" },
      description:
        "Entre 2 y 5 señales concretas encontradas en el mensaje, una línea cada una.",
    },
    recomendacion: {
      type: "string",
      description:
        "Una o dos oraciones con la acción concreta que debe tomar la persona.",
    },
  },
  required: ["veredicto", "confianza", "senales", "recomendacion"],
  additionalProperties: false,
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export default async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Método no permitido." }, 405);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return json(
      {
        error:
          "El analizador no está configurado en este despliegue. Falta la variable de entorno ANTHROPIC_API_KEY.",
      },
      503,
    );
  }

  let texto;
  try {
    ({ texto } = await req.json());
  } catch {
    return json({ error: "Cuerpo de la petición inválido." }, 400);
  }

  if (typeof texto !== "string" || texto.trim().length < 20) {
    return json(
      { error: "Pegue el mensaje completo (al menos 20 caracteres)." },
      400,
    );
  }

  const recortado = texto.slice(0, MAX_CHARS);

  try {
    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4000,
      system: SYSTEM,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: `Analice el siguiente mensaje sospechoso:\n\n<<<\n${recortado}\n>>>`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return json(
        {
          error:
            "No se pudo analizar este mensaje. Intente con otro texto o repórtelo a su equipo de TI.",
        },
        422,
      );
    }

    const bloque = response.content.find((b) => b.type === "text");
    if (!bloque) {
      return json({ error: "El análisis vino vacío. Intente de nuevo." }, 502);
    }

    // output_config.format garantiza JSON válido contra el esquema.
    return json(JSON.parse(bloque.text));
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return json(
        { error: "Hay muchas consultas en este momento. Intente en un minuto." },
        429,
      );
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return json(
        { error: "La API key configurada no es válida." },
        502,
      );
    }
    console.error("Fallo al analizar el mensaje:", err);
    return json(
      { error: "No se pudo completar el análisis. Intente de nuevo." },
      502,
    );
  }
};
