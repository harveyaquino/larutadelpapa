# Diagnóstico Digital MYPE — CCLAM Lambayeque × IDE Solution

Landing + cuestionario de 2 pasos + captura de contacto, pensado para escanear
por QR en el taller de la visita del Papa León XIV en Chiclayo. Al terminar,
la persona ve un **diagnóstico de su negocio (sin precios)**, y sus datos de
contacto quedan guardados en Supabase para hacer seguimiento comercial después.

Es un sitio 100% estático (HTML + CSS + JS, sin build), así que se despliega
en Vercel en segundos.

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

## 3. Probar en tu computadora (opcional)

Desde la carpeta `web/`:

```bash
npx serve .
```

y abre la URL que te muestre (normalmente http://localhost:3000).

## 4. Publicar en Vercel

**Opción A — con la terminal (rápido):**

```bash
npx vercel
```

Sigue las instrucciones (inicia sesión con tu cuenta de Vercel la primera vez).
Cuando pregunte por el directorio, confirma que sea `web/`. No necesita ningún
build command ni framework: es un sitio estático.

Para dejarlo en producción con una URL fija:

```bash
npx vercel --prod
```

**Opción B — desde vercel.com:**

1. Sube esta carpeta a un repositorio de GitHub.
2. En https://vercel.com → **Add New → Project** → importa el repositorio.
3. Framework Preset: **Other** (sitio estático). No requiere variables de entorno
   porque las claves ya están en `config.js`.
4. Deploy.

## 5. Generar el QR para el evento

Una vez que tengas la URL final de Vercel (algo como
`https://diagnostico-mype.vercel.app`), genera un código QR que apunte a esa
URL con cualquier generador de QR (Canva, la propia Vercel no lo hace, pero
hay decenas gratuitos) e imprímelo para el stand del taller.

## 6. Ver los contactos capturados

En Supabase → **Table Editor → leads** verás cada registro: nombre, negocio,
email, teléfono, tipo de negocio, problemas marcados y nivel de digitalización
calculado. Desde ahí puedes exportarlos a CSV para tu equipo comercial.

## Estructura del proyecto

```
web/
├── index.html          landing + wizard (4 pantallas)
├── styles.css           estilos (paleta navy + dorado, igual al mockup)
├── app.js                lógica del wizard + inserción en Supabase
├── config.js             credenciales públicas de Supabase (rellenar)
└── supabase/schema.sql   script SQL para crear la tabla `leads`
```

## Cómo editar el contenido del diagnóstico

Todo el texto de las "brechas" que se muestran en el resultado final vive en
`app.js`, dentro de `PROBLEM_INSIGHTS` y `BUSINESS_CONTEXT`. Ahí puedes ajustar
el mensaje sin tocar precios — el objetivo de esa pantalla es mostrar
**oportunidades y riesgos**, nunca una cotización.
