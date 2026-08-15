# SEGURO·GT — Capacitación anti-phishing para pymes

Prototipo funcional: clases, simulacros (correo, SMS/WhatsApp y llamada),
analizador de mensajes con IA, evaluación con certificado, recursos y panel de
administración. El estado de avance vive en memoria: al recargar la página se
reinicia (es intencional en un prototipo de demostración).

## Correr en local

```bash
npm install
npm run dev
```

Abre <http://localhost:5173>. Todo funciona salvo el **Analizador con IA**, que
necesita la Netlify Function (ver abajo).

Para probar el analizador en local hace falta la CLI de Netlify:

```bash
npm i -g netlify-cli && netlify dev
```

`netlify dev` levanta Vite y las funciones juntas en <http://localhost:8888>, y
lee la variable `ANTHROPIC_API_KEY` de un archivo `.env` en la raíz (copie
`.env.example`).

## Desplegar en Netlify

1. Suba el repositorio a GitHub y conéctelo en Netlify (**Add new site → Import
   an existing project**). `netlify.toml` ya define el build (`npm run build`),
   la carpeta publicada (`dist`) y las funciones.
2. En **Site configuration → Environment variables**, agregue:

   | Variable | Valor |
   | --- | --- |
   | `ANTHROPIC_API_KEY` | su clave de <https://console.anthropic.com> |

3. Deploy. Sin esa variable el sitio despliega igual y todo funciona, pero el
   Analizador responde con un aviso de que no está configurado.

## Cómo está armado

```
index.html                     entrada de Vite
src/main.jsx                   monta React
src/App.jsx                    toda la aplicación (datos + UI + estado)
netlify/functions/analizar.mjs proxy hacia la API de Anthropic
netlify.toml                   build, redirects (/api/* y SPA)
```

### El analizador y la API key

El navegador **nunca** ve la clave. El frontend hace `POST /api/analizar` con el
texto sospechoso; Netlify enruta eso a `netlify/functions/analizar.mjs`, que es
quien llama a la API de Anthropic con la clave del entorno y devuelve el
veredicto ya estructurado (`veredicto`, `confianza`, `senales`,
`recomendacion`).

El formato de la respuesta se garantiza con *structured outputs*
(`output_config.format`) contra un JSON Schema, en vez de pedirle al modelo por
prompt que "responda solo JSON" — así no hay que limpiar backticks ni manejar
respuestas mal formadas.

**Antes de abrirlo al público**, tome en cuenta que `/api/analizar` es un
endpoint sin autenticación que consume tokens: la función limita el texto a
6.000 caracteres, pero no tiene límite de peticiones por IP. Si el sitio va a
ser público conviene agregar rate limiting (Netlify lo ofrece en planes de pago,
o se puede poner el sitio detrás de Netlify Identity / una contraseña de sitio).

## Notas

- Los dominios, marcas y remitentes de los ejemplos son ficticios, con fines
  educativos.
- El panel de administración muestra datos de demostración; no hay backend de
  usuarios ni base de datos.
