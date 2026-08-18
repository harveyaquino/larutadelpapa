# Diagnóstico Digital MYPE — CCLAM Lambayeque × IDE Solution

Landing + cuestionario de 2 pasos, pensado para escanear por QR en el taller
de la visita del Papa León XIV en Chiclayo. Al terminar, una IA (Claude)
genera al instante un **diagnóstico personalizado (sin precios)** de las
oportunidades que el negocio está perdiendo, para generar interés real. Dejar
el correo para recibir el informe completo es **opcional**. El look and feel
está tomado de [ide-solution.com](https://www.ide-solution.com/) (mismos
colores, tipografía y logo), es 100% responsive, y tiene un botón flotante de
WhatsApp al costado que abre un chat directo con IDE Solution.

Es un sitio estático (HTML + CSS + JS) más **una función serverless** en
`api/diagnostico.js` que llama a la API de Claude — así la clave de Claude
nunca queda expuesta en el navegador. Se despliega en Vercel sin configurar
nada más que las variables de entorno.

## 1. Crear la base de datos en Supabase

1. Entra a https://supabase.com y crea una cuenta / un proyecto nuevo (plan gratuito alcanza de sobra).
2. En el proyecto, ve a **SQL Editor** → **New query**.
3. Copia y pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**.
   Esto crea la tabla `leads` y activa seguridad (RLS) para que la web solo pueda
   **insertar** datos, nunca leerlos ni borrarlos.
4. Ve a **Project Settings → API** y copia:
   - **Project URL**
   - **anon / public key**

## 2. Conectar la web con Supabase

Abre [`config.js`](config.js) y reemplaza los valores de ejemplo:

```js
window.SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
window.SUPABASE_ANON_KEY = "TU-ANON-KEY";
```

Es seguro que estos valores queden visibles en el navegador: la tabla `leads`
solo acepta INSERT gracias a la política de RLS del paso anterior.

## 3. Publicar en Vercel

**Opción A — con la terminal:**

```bash
npx vercel
```

Sigue las instrucciones (inicia sesión con tu cuenta de Vercel la primera vez).
Cuando pregunte por el directorio, confirma que sea `web/`.

**Opción B — desde vercel.com:**

1. Sube esta carpeta a un repositorio de GitHub (ya está listo con `git init` hecho).
2. En https://vercel.com → **Add New → Project** → importa el repositorio.
3. Framework Preset: **Other**. Deploy.

## 4. Agregar la clave de Claude (IA) en Vercel

El diagnóstico personalizado lo genera `api/diagnostico.js` usando la API de
Claude (`claude-opus-5`). Sin esta clave, la web sigue funcionando: muestra un
diagnóstico de respaldo (predefinido, sin IA) en vez de fallar.

1. En el proyecto de Vercel → **Settings → Environment Variables**.
2. Agrega: `ANTHROPIC_API_KEY` = tu clave de la consola de Anthropic (console.anthropic.com).
3. Aplica a **Production** (y Preview si vas a probar antes de publicar).
4. Vuelve a desplegar (`npx vercel --prod`) para que tome la variable.

## 5. Probar en tu computadora (opcional)

Como ahora hay una función serverless (`api/diagnostico.js`), un servidor
estático simple (`npx serve`) no la ejecuta. Usa el propio simulador de Vercel:

```bash
npx vercel dev
```

La primera vez te pedirá vincular el proyecto. Te dará una URL local (por
ejemplo `http://localhost:3000`) donde también corre `/api/diagnostico`. Para
que la IA responda en local, define la variable antes de levantar el server:

```bash
# PowerShell
$env:ANTHROPIC_API_KEY = "tu-clave"
npx vercel dev
```

## 6. Generar el QR para el evento

Una vez que tengas la URL final de Vercel (algo como
`https://diagnostico-mype.vercel.app`), genera un código QR que apunte a esa
URL con cualquier generador de QR e imprímelo para el stand del taller.

## 7. Ver los contactos capturados

En Supabase → **Table Editor → leads** verás cada registro: nombre (opcional),
negocio, email/teléfono (al menos uno), tipo de negocio, problemas marcados y
el diagnóstico que generó la IA para esa persona (columna `diagnostico_ia`).
Desde ahí puedes exportarlos a CSV para tu equipo comercial.

## Estructura del proyecto

```
web/
├── index.html              landing + wizard (3 pantallas) + botón WhatsApp
├── styles.css                estilos con la identidad de ide-solution.com
├── app.js                     lógica del wizard + llamada a /api/diagnostico + Supabase
├── config.js                  credenciales públicas de Supabase (rellenar)
├── package.json                dependencia del SDK de Anthropic
├── api/diagnostico.js         función serverless: genera el diagnóstico con Claude
└── supabase/schema.sql        script SQL para crear la tabla `leads`
```

## Cómo editar el contenido

- **Prompt de la IA** (tono, reglas, qué debe destacar): `api/diagnostico.js` → `SYSTEM_PROMPT`.
- **Diagnóstico de respaldo** (si la IA falla o no hay clave configurada): `app.js` → `PROBLEM_INSIGHTS` / `BUSINESS_CONTEXT`.
- **Número de WhatsApp**: `index.html` → busca `wa.me/51964484382` (es el número público de IDE Solution).

En ningún punto del flujo se muestra un precio — ni en el diagnóstico de la
IA (el prompt lo prohíbe explícitamente) ni en el contenido de respaldo.
