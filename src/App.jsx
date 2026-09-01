import React, { useState, useEffect, useRef } from "react";

/* ============================================================
   SEGURO — Capacitación anti-phishing para pymes (Guatemala)
   Prototipo funcional: clases, simulador, evaluación, recursos
   y panel de administración. Todo el estado vive en memoria.
   ============================================================ */

const T = {
  bg: "#F2F5F4",
  surface: "#FFFFFF",
  ink: "#0C1F22",
  inkSoft: "#4A5D60",
  line: "#DDE5E3",
  brand: "#0E5E63",
  brandSoft: "#E3EEEE",
  danger: "#C0392F",
  dangerSoft: "#FBEAE8",
  warn: "#B97A12",
  warnSoft: "#FBF1DD",
  ok: "#25794F",
  okSoft: "#E4F2EA",
  chipBg: "#0C1F22",
  chipTx: "#BFE3D6",
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
* { box-sizing: border-box; }
body { margin: 0; }
.sg-root { font-family: 'Inter', system-ui, sans-serif; color: ${T.ink}; background: ${T.bg}; min-height: 100vh; }
.sg-display { font-family: 'Archivo', system-ui, sans-serif; }
.sg-mono { font-family: 'IBM Plex Mono', monospace; }
.sg-btn { border: none; cursor: pointer; font-family: 'Archivo', sans-serif; font-weight: 700; border-radius: 10px; transition: transform .08s ease, opacity .15s ease; }
.sg-btn:hover { opacity: .92; }
.sg-btn:active { transform: scale(.97); }
.sg-btn:focus-visible, .sg-nav:focus-visible { outline: 3px solid ${T.warn}; outline-offset: 2px; }
.sg-card { background: ${T.surface}; border: 1px solid ${T.line}; border-radius: 14px; }
.sg-nav { border: none; background: transparent; cursor: pointer; font-family: 'Archivo', sans-serif; }
.sg-hot { cursor: pointer; transition: background .15s ease; }
.sg-hot:hover { background: ${T.warnSoft}; }
.ol-item:hover { background: #F3F2F1 !important; }
.ol-cmd:hover:not(:disabled) { background: #F3F2F1; border-radius: 4px; }
.sg-burger { display: none; border: none; background: transparent; cursor: pointer; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 12px 10px; margin-left: auto; border-radius: 8px; }
.sg-burger:focus-visible { outline: 3px solid ${T.warn}; outline-offset: 2px; }
.sg-burger span { display: block; width: 21px; height: 2.5px; background: ${T.ink}; border-radius: 2px; transition: transform .2s ease, opacity .2s ease; }
.sg-mobilemenu { display: none; }
@keyframes sgMenuIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
@keyframes sgItemIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: none; } }
@media (max-width: 760px) {
  .sg-desktopnav { display: none !important; }
  .sg-burger { display: inline-flex; }
  .sg-mobilemenu { display: block; }
}
@media (max-width: 820px) { .ol-folders { display: none !important; } }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;

/* ------------------------- DATOS: CLASES ------------------------- */

const MODULES = [
  {
    id: "m1",
    tag: "Módulo 1",
    title: "¿Qué es el phishing?",
    minutes: 5,
    lessons: [
      {
        id: "m1l1",
        title: "El engaño como herramienta",
        body: [
          "El phishing no ataca sistemas: ataca personas. Es un mensaje diseñado para que usted haga algo que beneficia al atacante — entregar una contraseña, abrir un adjunto, autorizar una transferencia — creyendo que hace algo normal.",
          "En una pyme, un solo clic puede significar acceso a la banca en línea de la empresa, al correo del gerente o a los datos de clientes. El 90% de los incidentes de seguridad en empresas pequeñas empieza con un correo.",
          "La buena noticia: el phishing depende de que usted no se detenga a verificar. Detenerse 10 segundos desarma la mayoría de ataques.",
        ],
        key: "Regla de oro: nadie legítimo le pedirá su contraseña, código o transferencia urgente por mensaje.",
      },
      {
        id: "m1l2",
        title: "Los 5 tipos que verá en su empresa",
        body: [
          "Email phishing — el clásico: un correo que imita a un banco, a la SAT o a un proveedor, con un enlace o adjunto malicioso.",
          "Smishing — el mismo engaño por SMS o WhatsApp: «Su paquete está retenido, pague Q15 aquí».",
          "Vishing — por llamada: alguien que dice ser del banco y le pide «confirmar» un código que acaba de llegar a su teléfono. Ese código es la llave de su cuenta.",
          "Quishing — códigos QR falsos pegados sobre menús, parqueos o afiches que llevan a páginas de robo de datos.",
          "BEC (fraude del CEO) — el más caro para pymes: un correo que aparenta venir del gerente o de un proveedor pidiendo una transferencia o el cambio de una cuenta bancaria de pago.",
        ],
        key: "El canal cambia, el guion no: suplantar identidad + crear urgencia + pedir una acción.",
      },
    ],
    quiz: [
      {
        q: "Un mensaje de WhatsApp dice que su paquete está retenido y debe pagar Q15 en un enlace. ¿Qué tipo de ataque es?",
        options: ["Vishing", "Smishing", "Quishing", "BEC"],
        answer: 1,
        explain: "El engaño por SMS o mensajería instantánea se llama smishing. El monto pequeño busca que pague sin pensar — el objetivo real es su tarjeta.",
      },
      {
        q: "¿Cuál es el ataque que más dinero cuesta a las pymes?",
        options: ["Premios falsos", "QR falsos", "BEC / fraude del CEO", "Cadenas de correos"],
        answer: 2,
        explain: "El BEC suplanta a un jefe o proveedor para desviar transferencias reales. Una sola transferencia desviada puede superar cualquier otro fraude.",
      },
    ],
  },
  {
    id: "m2",
    tag: "Módulo 2",
    title: "Anatomía de un correo malicioso",
    minutes: 7,
    lessons: [
      {
        id: "m2l1",
        title: "El remitente: mire el dominio, no el nombre",
        body: [
          "El nombre que se muestra («SAT Guatemala», «Banco Industrial») lo escribe el atacante y puede decir cualquier cosa. Lo que importa es el dominio: lo que va después de la @.",
          "Trucos comunes: dominios parecidos (sat-gt-avisos.com en lugar de sat.gob.gt), letras cambiadas (micros0ft.com, banrura1.com) y subdominios engañosos (sat.gob.gt.verificacion.net — el dominio real es verificacion.net).",
          "Regla práctica: lea el dominio de derecha a izquierda. Lo que está justo antes del primer / es el dueño real del sitio.",
        ],
        key: "El nombre mostrado miente; el dominio no puede mentir. Léalo de derecha a izquierda.",
      },
      {
        id: "m2l2",
        title: "Urgencia, enlaces y adjuntos",
        body: [
          "Urgencia artificial: «su cuenta será bloqueada en 24 horas», «último aviso», «multa por omiso». El miedo y la prisa apagan el pensamiento crítico — es el mecanismo central del phishing.",
          "Enlaces: el texto del enlace puede decir www.sat.gob.gt y llevar a otro lado. En computadora, pase el cursor sin hacer clic y mire la esquina inferior. En celular, mantenga presionado el enlace para ver el destino real.",
          "Adjuntos: desconfíe de .zip, .html y documentos que piden «habilitar macros» o «habilitar contenido». Una factura legítima no necesita macros.",
          "Errores de forma: saludos genéricos («Estimado cliente»), redacción extraña o logos pixelados suman sospecha, pero su ausencia no garantiza nada — los ataques con IA ya escriben perfecto.",
        ],
        key: "Urgencia + enlace o adjunto + petición de datos = detenerse y verificar por otro canal.",
      },
    ],
    quiz: [
      {
        q: "Recibe un correo de «SAT Guatemala <avisos@sat.gob.gt.notificacion-gt.com>». ¿Cuál es el dominio real?",
        options: ["sat.gob.gt", "notificacion-gt.com", "gob.gt", "avisos.com"],
        answer: 1,
        explain: "Se lee de derecha a izquierda: el dominio registrado es notificacion-gt.com. Todo lo anterior es un subdominio decorativo para engañar.",
      },
      {
        q: "¿Cómo verifica el destino real de un enlace en el celular?",
        options: ["Haciendo clic rápido", "Manteniéndolo presionado", "Reenviándolo a un colega", "Mirando el logo del correo"],
        answer: 1,
        explain: "Mantener presionado muestra la URL de destino sin abrirla. En computadora, pasar el cursor por encima cumple la misma función.",
      },
    ],
  },
  {
    id: "m3",
    tag: "Módulo 3",
    title: "Casos reales en Guatemala",
    minutes: 6,
    lessons: [
      {
        id: "m3l1",
        title: "SAT, bancos e IGSS: los disfraces favoritos",
        body: [
          "Falsa SAT: correos con «aviso de omiso», «multa pendiente» o «devolución de crédito fiscal» con un enlace para «regularizar su situación». La SAT notifica por su Agencia Virtual, no pide pagos por enlaces en correos.",
          "Falso banco: «detectamos un acceso inusual, verifique su cuenta». Los bancos guatemaltecos nunca piden usuario, contraseña, PIN ni códigos por correo, SMS o llamada. Ante la duda: cierre el mensaje y entre usted mismo por la app oficial.",
          "Falso IGSS o RRHH: «actualización de datos del empleado», «nueva planilla adjunta». Buscan credenciales corporativas para entrar al correo de la empresa.",
        ],
        key: "Ante cualquier aviso de banco, SAT o IGSS: no use el enlace del mensaje. Entre por la app o el sitio oficial escribiendo la dirección usted mismo.",
      },
      {
        id: "m3l2",
        title: "El fraude del proveedor (BEC)",
        body: [
          "El escenario típico en una pyme: contabilidad recibe un correo de un proveedor real diciendo que «cambió de cuenta bancaria» y adjunta la nueva para el próximo pago. El correo viene de un dominio casi idéntico o de la cuenta comprometida del proveedor.",
          "Variante interna: un correo «del gerente» pide una transferencia urgente y confidencial, casualmente cuando el gerente está de viaje o en reunión.",
          "Defensa única y suficiente: todo cambio de cuenta bancaria y toda transferencia inusual se confirma por teléfono, al número que usted ya tenía, nunca al que aparece en el correo.",
        ],
        key: "Cambio de cuenta o pago urgente = llamada de confirmación al número conocido. Sin excepciones, ni para el gerente.",
      },
    ],
    quiz: [
      {
        q: "Un proveedor de años le escribe: «cambiamos de banco, deposite a esta nueva cuenta». ¿Qué hace primero?",
        options: [
          "Deposita: es un proveedor de confianza",
          "Responde el correo pidiendo confirmación",
          "Llama al número que ya tenía del proveedor",
          "Pide el cambio por escrito en el mismo hilo",
        ],
        answer: 2,
        explain: "Si la cuenta del proveedor está comprometida, responder el correo es hablar con el atacante. La confirmación va por un canal distinto: el teléfono que usted ya conocía.",
      },
      {
        q: "Recibe un correo de la SAT sobre una multa con enlace de pago. ¿Cuál es la acción correcta?",
        options: [
          "Pagar rápido para evitar recargos",
          "Entrar por su cuenta a la Agencia Virtual oficial",
          "Reenviarlo a contabilidad para que paguen",
          "Responder pidiendo más detalles",
        ],
        answer: 1,
        explain: "Si la multa existe, aparecerá en su Agencia Virtual. Nunca gestione pagos desde enlaces recibidos por correo.",
      },
    ],
  },
  {
    id: "m4",
    tag: "Módulo 4",
    title: "Ya hice clic: respuesta a incidentes",
    minutes: 5,
    lessons: [
      {
        id: "m4l1",
        title: "Los primeros 30 minutos",
        body: [
          "Caer en un phishing no es el desastre; ocultarlo sí. La velocidad de respuesta define el daño, y por eso su empresa necesita una cultura donde reportar sea seguro y rápido.",
          "Paso 1 — Desconecte: si abrió un adjunto sospechoso, desconecte el equipo de la red (WiFi y cable).",
          "Paso 2 — Cambie contraseñas: desde OTRO dispositivo, cambie la contraseña de la cuenta afectada y de cualquier cuenta que use la misma.",
          "Paso 3 — Avise: reporte de inmediato al responsable de TI o al canal de reporte de su empresa. Cada minuto cuenta.",
          "Paso 4 — Si hay dinero de por medio: llame al banco de inmediato para intentar retener la transferencia y presente denuncia.",
          "Paso 5 — Documente: guarde el correo original (no lo borre), capturas y horas. Sirve para el banco, la denuncia y para proteger al resto del equipo.",
        ],
        key: "Reportar en 5 minutos vale más que cualquier antivirus. Nadie debe ser castigado por reportar un clic.",
      },
    ],
    quiz: [
      {
        q: "Escribió su contraseña en una página falsa hace 2 minutos. ¿Qué hace primero?",
        options: [
          "Apagar el teléfono",
          "Cambiar la contraseña desde otro dispositivo y avisar a TI",
          "Borrar el correo para que nadie más caiga",
          "Esperar a ver si pasa algo raro",
        ],
        answer: 1,
        explain: "El atacante puede usar la credencial en segundos. Cambiarla de inmediato y avisar permite bloquear el acceso antes de que haya daño. El correo no se borra: es evidencia.",
      },
    ],
  },
  {
    id: "m5",
    tag: "Módulo 5",
    title: "Blindar la pyme: hábitos y política",
    minutes: 6,
    lessons: [
      {
        id: "m5l1",
        title: "Tres defensas que cuestan poco",
        body: [
          "MFA en todo: active la verificación en dos pasos en el correo corporativo, la banca en línea y los sistemas críticos. Es la medida con mejor relación costo-beneficio que existe: aun si roban la contraseña, no pueden entrar.",
          "Contraseñas únicas: una contraseña por servicio, idealmente con un gestor de contraseñas. La razón: cuando un sitio cualquiera es hackeado, los atacantes prueban esa misma contraseña en su correo y su banco.",
          "Proceso de pagos a prueba de correos: defina por escrito que ningún cambio de cuenta ni transferencia inusual se ejecuta sin confirmación telefónica. El proceso protege incluso al colaborador nuevo en su primer día.",
        ],
        key: "MFA + contraseñas únicas + doble confirmación de pagos: el 80% de la protección con el 20% del esfuerzo.",
      },
      {
        id: "m5l2",
        title: "Cultura de reporte",
        body: [
          "Defina UN canal claro para reportar correos sospechosos (un correo interno tipo reportes@suempresa.com.gt o un chat directo con TI) y comuníquelo a todos.",
          "Celebre los reportes, incluso los falsos positivos. Un equipo que reporta de más es un equipo que detecta a tiempo; un equipo que teme reportar es un equipo que oculta incidentes.",
          "Repita la capacitación: una vez al trimestre, 15 minutos y una simulación bastan para mantener el reflejo activo. Los atacantes cambian de disfraz; el hábito de verificar no debe cambiar.",
        ],
        key: "Sospechó → reportó → siguió trabajando. Ese es el flujo completo que su equipo debe memorizar.",
      },
    ],
    quiz: [
      {
        q: "¿Cuál medida evita el acceso a una cuenta aun cuando la contraseña fue robada?",
        options: [
          "Cambiar la contraseña cada semana",
          "Autenticación en dos pasos (MFA)",
          "Usar modo incógnito",
          "Tener antivirus actualizado",
        ],
        answer: 1,
        explain: "Con MFA, la contraseña sola no basta: el atacante necesita también el segundo factor. Por eso es la primera medida a implementar en cualquier pyme.",
      },
      {
        q: "Un colaborador reporta como sospechoso un correo que resultó legítimo. ¿Cuál es la respuesta correcta de la empresa?",
        options: [
          "Pedirle más cuidado la próxima vez",
          "Agradecerle el reporte",
          "Quitarle acceso al correo",
          "Ignorar el reporte",
        ],
        answer: 1,
        explain: "Los falsos positivos son el costo natural de una cultura de reporte sana. Castigarlos enseña al equipo a callar, que es exactamente lo que el atacante necesita.",
      },
    ],
  },
];

/* ---------------------- DATOS: SIMULADOR ---------------------- */

const SIM_EMAILS = [
  {
    id: 1,
    from: "SAT Guatemala",
    addr: "notificaciones@sat-avisos-gt.com",
    subject: "URGENTE: Aviso de omiso — regularice en 24 horas",
    time: "08:12",
    body:
      "Estimado contribuyente:\n\nHemos detectado una omisión en sus declaraciones. Para evitar una multa de Q5,000.00 debe regularizar su situación en las próximas 24 horas ingresando al siguiente enlace:\n\n➜ http://bit.ly/sat-regularizar\n\nDepartamento de Cobranza",
    phish: true,
    link: { text: "http://bit.ly/sat-regularizar", dest: "http://198.51.100.44/sat-gt/login.php" },
    clues: [
      "Dominio falso: sat-avisos-gt.com no es sat.gob.gt",
      "Urgencia artificial: plazo de 24 horas y amenaza de multa",
      "Enlace acortado (bit.ly) que oculta el destino real",
      "Saludo genérico: «Estimado contribuyente», sin NIT ni nombre",
    ],
  },
  {
    id: 2,
    from: "Recursos Humanos",
    addr: "rrhh@suempresa.com.gt",
    subject: "Recordatorio: entrega de constancias — viernes 15",
    time: "09:05",
    body:
      "Buen día a todos:\n\nLes recordamos que el viernes 15 es la fecha límite para entregar sus constancias en la oficina de RRHH, en horario normal.\n\nCualquier duda, pueden pasar directamente con nosotros o escribir a esta dirección.\n\nSaludos,\nRecursos Humanos",
    phish: false,
    clues: [
      "Dominio corporativo correcto: suempresa.com.gt",
      "No pide clics, datos ni descargas",
      "Proceso verificable en persona dentro de la empresa",
    ],
  },
  {
    id: 3,
    from: "Gerencia General",
    addr: "gerente.general@suempresa-gt.com",
    subject: "Transferencia confidencial — necesito esto HOY",
    time: "10:41",
    body:
      "Necesito que realices una transferencia de Q48,500 a la cuenta que te enviaré a continuación. Es para cerrar un negocio confidencial, no lo comentes con nadie todavía.\n\nEstoy entrando a reuniones todo el día, no puedo contestar llamadas. Confírmame solo por este correo cuando esté hecho.\n\nGracias por tu discreción.",
    phish: true,
    clues: [
      "Dominio alterado: suempresa-gt.com en lugar de suempresa.com.gt",
      "Pide secreto y bloquea la verificación telefónica: señales clásicas de BEC",
      "Urgencia + monto alto + canal único (solo por correo)",
    ],
  },
  {
    id: 4,
    from: "Soporte Microsoft",
    addr: "seguridad@micros0ft-support.com",
    subject: "Su contraseña expira hoy — acción requerida",
    time: "11:20",
    body:
      "Su contraseña de Office 365 expira hoy.\n\nPara mantener el acceso a su correo, verifique su cuenta ahora:\n\n➜ https://login-office365.micros0ft-support.com\n\nSi no lo hace, su cuenta será suspendida.",
    phish: true,
    link: { text: "https://login-office365.micros0ft-support.com", dest: "https://login-office365.micros0ft-support.com/common/oauth2" },
    clues: [
      "Typosquatting: micros0ft con cero en lugar de la letra o",
      "Amenaza de suspensión inmediata para provocar el clic",
      "La página de destino imita el login para robar la credencial",
    ],
  },
  {
    id: 5,
    from: "Banco — Avisos",
    addr: "avisos@subanco.com.gt",
    subject: "Nuevo horario de agencias a partir de agosto",
    time: "12:02",
    body:
      "Estimado cliente:\n\nLe informamos que a partir de agosto nuestras agencias atenderán de 9:00 a 17:00 horas.\n\nRecuerde que puede realizar sus operaciones desde nuestra app oficial. Nunca le solicitaremos contraseñas ni códigos por correo o teléfono.\n\nAtentamente,\nSu Banco",
    phish: false,
    clues: [
      "Informa sin pedir: no hay enlaces de acceso, datos ni descargas",
      "Dominio oficial del banco",
      "Refuerza la práctica correcta: usar la app oficial",
    ],
  },
  {
    id: 6,
    from: "DHL Express",
    addr: "entregas@dhl-paquete-gt.net",
    subject: "Su paquete está retenido — pague Q15.00 de aduana",
    time: "13:37",
    body:
      "Su paquete #GT-88213 no pudo ser entregado por un cargo aduanal pendiente de Q15.00.\n\nPague ahora para reprogramar la entrega:\n\n➜ http://dhl-paquete-gt.net/pago\n\nSi no paga en 48 horas, el paquete será devuelto.",
    phish: true,
    link: { text: "http://dhl-paquete-gt.net/pago", dest: "http://dhl-paquete-gt.net/pago/tarjeta.php" },
    clues: [
      "Dominio inventado: dhl-paquete-gt.net no pertenece a DHL",
      "Monto pequeño a propósito: el objetivo es capturar su tarjeta",
      "Presión de tiempo: devolución en 48 horas",
    ],
  },
  {
    id: 7,
    from: "Distribuidora El Progreso",
    addr: "creditos@elprogreso.com.gt",
    subject: "Estado de cuenta julio 2026",
    time: "14:15",
    body:
      "Buenas tardes:\n\nAdjuntamos su estado de cuenta correspondiente a julio (PDF).\n\nCualquier diferencia puede reportarla al 233XX-XXXX con su ejecutivo de cuenta, como siempre.\n\nSaludos cordiales,\nDepartamento de Créditos",
    phish: false,
    clues: [
      "Proveedor y dominio conocidos, proceso mensual habitual",
      "Ofrece verificación por el canal telefónico de siempre",
      "PDF simple, sin macros ni instrucciones extrañas",
    ],
  },
  {
    id: 8,
    from: "Premios Guatemala",
    addr: "ganadores@promos-premiadas.info",
    subject: "🎉 ¡FELICIDADES! Ganó una tarjeta de Q2,000",
    time: "15:09",
    body:
      "¡Su correo fue seleccionado entre miles!\n\nGanó una tarjeta de regalo de Q2,000 de un supermercado reconocido. Solo debe confirmar sus datos y pagar Q25 de gastos de envío.\n\n➜ Reclamar mi premio\n\nOferta válida solo por hoy.",
    phish: true,
    link: { text: "Reclamar mi premio", dest: "http://promos-premiadas.info/claim?id=88213" },
    clues: [
      "Premio no solicitado: usted no participó en nada",
      "Pide datos personales y un pago para «liberar» el premio",
      "Presión: «válido solo por hoy»",
    ],
  },
  {
    id: 9,
    from: "Contabilidad",
    addr: "contabilidad@suempresa.com.gt",
    subject: "Planilla_Julio.zip — habilitar contenido para ver",
    time: "16:30",
    body:
      "Buenas tardes,\n\nAdjunto la planilla de julio. El archivo está protegido: al abrirlo, haga clic en «Habilitar contenido» para poder visualizarlo.\n\nSaludos.",
    phish: true,
    clues: [
      "«Habilitar contenido» activa macros: vía clásica de instalación de malware",
      "Adjunto .zip para evadir los filtros del correo",
      "Aunque el dominio parece interno, la cuenta pudo ser comprometida: el pedido de macros es la alerta",
    ],
  },
  {
    id: 10,
    from: "Calendario corporativo",
    addr: "calendario@suempresa.com.gt",
    subject: "Invitación: Reunión de ventas — lunes 10:00",
    time: "17:02",
    body:
      "Se le ha invitado a la reunión «Resultados de ventas» el lunes a las 10:00 en la sala de juntas.\n\nOrganiza: Dirección Comercial.\n\nPuede confirmar su asistencia desde su calendario corporativo.",
    phish: false,
    clues: [
      "Invitación interna esperada, del dominio corporativo",
      "No solicita credenciales ni pagos",
      "Verificable directamente en el calendario de la empresa",
    ],
  },
];

/* ---------------------- DATOS: EVALUACIÓN ---------------------- */

const EXAM = [
  {
    q: "¿Cuál es la parte de un correo que el atacante NO puede falsificar libremente?",
    options: ["El nombre mostrado", "El asunto", "El dominio real después de la @", "La firma con logo"],
    answer: 2,
  },
  {
    q: "En «sat.gob.gt.avisos-tributarios.net», el sitio pertenece a:",
    options: ["sat.gob.gt", "gob.gt", "avisos-tributarios.net", "sat.gob"],
    answer: 2,
  },
  {
    q: "El mecanismo psicológico central del phishing es:",
    options: ["La curiosidad", "La urgencia y el miedo", "La avaricia", "El aburrimiento"],
    answer: 1,
  },
  {
    q: "Un correo del «gerente» pide una transferencia urgente y confidencial. Lo correcto es:",
    options: [
      "Ejecutarla: viene del jefe",
      "Responder el correo pidiendo confirmación",
      "Confirmar por teléfono al número conocido del gerente",
      "Esperar a que insista",
    ],
    answer: 2,
  },
  {
    q: "Para verificar un enlace en el celular sin abrirlo:",
    options: ["Tocarlo rápido", "Mantenerlo presionado", "Hacer captura de pantalla", "Copiarlo y pegarlo en el navegador"],
    answer: 1,
  },
  {
    q: "Un documento adjunto pide «Habilitar macros» para verse. Eso indica:",
    options: [
      "Un formato moderno de Office",
      "Probable malware: no habilitar y reportar",
      "Que el archivo es confidencial",
      "Que falta actualizar Office",
    ],
    answer: 1,
  },
  {
    q: "Escribió su contraseña en una página falsa. La primera acción es:",
    options: [
      "Borrar el historial",
      "Cambiar la contraseña desde otro dispositivo y avisar a TI",
      "Apagar el equipo y esperar",
      "Crear un correo nuevo",
    ],
    answer: 1,
  },
  {
    q: "La medida que protege una cuenta incluso si roban la contraseña:",
    options: ["Antivirus", "MFA / verificación en dos pasos", "Modo incógnito", "Cambiar de navegador"],
    answer: 1,
  },
  {
    q: "Un proveedor avisa por correo que cambió de cuenta bancaria. Antes de pagar:",
    options: [
      "Se confirma por teléfono al número que ya se tenía",
      "Se responde el mismo correo",
      "Se paga un monto pequeño de prueba",
      "Se espera la siguiente factura",
    ],
    answer: 0,
  },
  {
    q: "Un colaborador reporta un correo sospechoso que resultó legítimo. La empresa debe:",
    options: ["Llamarle la atención", "Agradecer el reporte", "Ignorarlo", "Restringirle el correo"],
    answer: 1,
  },
];

/* ---------------------- DATOS: PANEL ADMIN ---------------------- */

const TEAM = [
  { name: "María López", area: "Contabilidad", avance: 100, sim: 90, exam: 90 },
  { name: "Carlos Pérez", area: "Ventas", avance: 80, sim: 70, exam: null },
  { name: "Ana Ramírez", area: "RRHH", avance: 100, sim: 100, exam: 100 },
  { name: "Jorge Méndez", area: "Bodega", avance: 40, sim: 50, exam: null },
  { name: "Lucía García", area: "Gerencia", avance: 60, sim: 80, exam: null },
  { name: "Pedro Sical", area: "TI", avance: 100, sim: 100, exam: 90 },
];

/* ========================= COMPONENTES ========================= */

const DomainChip = ({ addr, danger }) => {
  const at = addr.indexOf("@");
  const user = addr.slice(0, at + 1);
  const domain = addr.slice(at + 1);
  return (
    <span
      className="sg-mono"
      style={{
        background: T.chipBg,
        color: T.chipTx,
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 12,
        display: "inline-block",
        wordBreak: "break-all",
      }}
    >
      {user}
      <span style={{ color: danger ? "#F5A097" : "#8FD8B8", fontWeight: 600 }}>{domain}</span>
    </span>
  );
};

const Badge = ({ children, tone = "brand" }) => {
  const map = {
    brand: [T.brandSoft, T.brand],
    danger: [T.dangerSoft, T.danger],
    ok: [T.okSoft, T.ok],
    warn: [T.warnSoft, T.warn],
  };
  const [bg, fg] = map[tone];
  return (
    <span
      className="sg-display"
      style={{
        background: bg,
        color: fg,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: 999,
      }}
    >
      {children}
    </span>
  );
};

const Progress = ({ pct, tone = T.brand }) => (
  <div style={{ background: T.line, borderRadius: 999, height: 8, overflow: "hidden" }}>
    <div style={{ width: `${pct}%`, background: tone, height: "100%", borderRadius: 999, transition: "width .3s ease" }} />
  </div>
);

/* ------------------------- INICIO / HERO ------------------------- */

const HOTSPOTS = [
  { id: "h1", label: "1", title: "Nombre mostrado vs. dominio", text: "«Banco Seguro GT» lo escribe el atacante. El dominio real, banco-alertas-gt.com, delata la suplantación." },
  { id: "h2", label: "2", title: "Urgencia artificial", text: "«Será bloqueada en 24 horas»: el miedo y la prisa son el motor del phishing. Un aviso real no funciona así." },
  { id: "h3", label: "3", title: "Enlace disfrazado", text: "El texto dice www.subanco.com.gt, pero el destino real es otro. Verifique manteniendo presionado o pasando el cursor." },
];

function Home({ go, stats }) {
  const [hot, setHot] = useState("h1");
  const active = HOTSPOTS.find((h) => h.id === hot);
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <Badge tone="warn">Capacitación para pymes · Guatemala</Badge>
          <h1 className="sg-display" style={{ fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.08, margin: "14px 0 12px", fontWeight: 800 }}>
            Su equipo es el firewall.
            <br />
            <span style={{ color: T.brand }}>Entrénelo a detectar el engaño.</span>
          </h1>
          <p style={{ color: T.inkSoft, fontSize: 16, lineHeight: 1.6, maxWidth: 520 }}>
            Cinco clases cortas, un simulador de bandeja de entrada con correos reales del contexto guatemalteco y una
            evaluación con certificado. Todo en menos de una hora, sin lenguaje técnico.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <button className="sg-btn" onClick={() => go("clases")} style={{ background: T.brand, color: "#fff", padding: "13px 22px", fontSize: 15 }}>
              Empezar las clases
            </button>
            <button className="sg-btn" onClick={() => go("simulador")} style={{ background: T.surface, color: T.brand, border: `2px solid ${T.brand}`, padding: "11px 22px", fontSize: 15 }}>
              Probar los simulacros
            </button>
          </div>
          <div style={{ display: "flex", gap: 22, marginTop: 26, flexWrap: "wrap" }}>
            {[
              ["5", "módulos de clase"],
              ["3", "simulacros: correo, chat y llamada"],
              ["~45", "minutos en total"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="sg-display" style={{ fontSize: 26, fontWeight: 800, color: T.brand }}>{n}</div>
                <div style={{ fontSize: 12, color: T.inkSoft }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature: correo diseccionado interactivo */}
        <div style={{ flex: "1 1 360px", minWidth: 300 }}>
          <div className="sg-card" style={{ overflow: "hidden", boxShadow: "0 12px 32px rgba(12,31,34,.10)" }}>
            <div style={{ background: T.chipBg, color: "#fff", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="sg-display" style={{ fontWeight: 700, fontSize: 13 }}>Disección de un phishing real</span>
              <Badge tone="danger">Ejemplo</Badge>
            </div>
            <div style={{ padding: 16 }}>
              <div className="sg-hot" onClick={() => setHot("h1")} style={{ borderRadius: 8, padding: "8px 10px", border: hot === "h1" ? `2px solid ${T.warn}` : "2px solid transparent" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  <span style={{ background: T.warn, color: "#fff", borderRadius: 999, padding: "0 7px", marginRight: 8, fontSize: 11 }}>1</span>
                  Banco Seguro GT
                </div>
                <div style={{ marginTop: 4 }}>
                  <DomainChip addr="alertas@banco-alertas-gt.com" danger />
                </div>
              </div>
              <div className="sg-hot" onClick={() => setHot("h2")} style={{ borderRadius: 8, padding: "8px 10px", marginTop: 4, border: hot === "h2" ? `2px solid ${T.warn}` : "2px solid transparent" }}>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <span style={{ background: T.warn, color: "#fff", borderRadius: 999, padding: "0 7px", marginRight: 8, fontSize: 11 }}>2</span>
                  Detectamos un acceso inusual. Su cuenta <b>será bloqueada en 24 horas</b> si no verifica su identidad.
                </div>
              </div>
              <div className="sg-hot" onClick={() => setHot("h3")} style={{ borderRadius: 8, padding: "8px 10px", marginTop: 4, border: hot === "h3" ? `2px solid ${T.warn}` : "2px solid transparent" }}>
                <div style={{ fontSize: 13 }}>
                  <span style={{ background: T.warn, color: "#fff", borderRadius: 999, padding: "0 7px", marginRight: 8, fontSize: 11 }}>3</span>
                  <span style={{ color: T.brand, textDecoration: "underline" }}>www.subanco.com.gt/verificar</span>
                  <span className="sg-mono" style={{ fontSize: 11, color: T.danger, display: "block", marginLeft: 30 }}>
                    destino real → http://198.51.100.7/login
                  </span>
                </div>
              </div>
              <div style={{ background: T.warnSoft, borderRadius: 10, padding: "12px 14px", marginTop: 12 }}>
                <div className="sg-display" style={{ fontSize: 13, fontWeight: 700, color: T.warn }}>{active.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.55, marginTop: 4 }}>{active.text}</div>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: T.inkSoft, textAlign: "center", marginTop: 8 }}>Toque los números para explorar cada señal</p>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="sg-card" style={{ marginTop: 26, padding: "16px 20px", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div className="sg-display" style={{ fontWeight: 700, fontSize: 14 }}>Su avance</div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Progress pct={stats.pct} />
          </div>
          <div style={{ fontSize: 13, color: T.inkSoft }}>
            {stats.done} de {stats.total} lecciones · {stats.pct}%
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- CLASES --------------------------- */

function Lesson({ lesson, done, onDone }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sg-card" style={{ marginTop: 10, overflow: "hidden" }}>
      <button
        className="sg-nav"
        onClick={() => setOpen(!open)}
        style={{ width: "100%", textAlign: "left", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}
      >
        <span
          style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
            background: done ? T.ok : T.line, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700,
          }}
        >
          {done ? "✓" : ""}
        </span>
        <span style={{ fontWeight: 700, fontSize: 15, flex: 1, color: T.ink }}>{lesson.title}</span>
        <span style={{ color: T.inkSoft, fontSize: 18 }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px 52px" }}>
          {lesson.body.map((p, i) => (
            <p key={i} style={{ fontSize: 14.5, lineHeight: 1.65, color: T.ink, margin: "0 0 12px" }}>{p}</p>
          ))}
          <div style={{ background: T.brandSoft, borderLeft: `4px solid ${T.brand}`, borderRadius: "0 10px 10px 0", padding: "12px 14px", margin: "4px 0 14px" }}>
            <span className="sg-display" style={{ fontSize: 12, fontWeight: 800, color: T.brand, letterSpacing: ".06em" }}>PARA RECORDAR — </span>
            <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{lesson.key}</span>
          </div>
          {!done && (
            <button className="sg-btn" onClick={onDone} style={{ background: T.brand, color: "#fff", padding: "9px 18px", fontSize: 13 }}>
              Marcar como completada
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ModuleQuiz({ quiz, saved, onPass }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(saved);
  const allAnswered = quiz.every((_, i) => answers[i] !== undefined);
  const correct = quiz.filter((q, i) => answers[i] === q.answer).length;

  if (checked && saved) {
    return (
      <div style={{ background: T.okSoft, borderRadius: 12, padding: "14px 18px", marginTop: 14, color: T.ok, fontWeight: 600, fontSize: 14 }}>
        ✓ Quiz del módulo aprobado
      </div>
    );
  }
  return (
    <div className="sg-card" style={{ marginTop: 14, padding: 18, borderColor: T.brand }}>
      <div className="sg-display" style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Quiz del módulo</div>
      {quiz.map((q, i) => (
        <div key={i} style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.5 }}>{i + 1}. {q.q}</div>
          <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
            {q.options.map((op, j) => {
              const sel = answers[i] === j;
              const isRight = checked && j === q.answer;
              const isWrong = checked && sel && j !== q.answer;
              return (
                <button
                  key={j}
                  className="sg-nav"
                  disabled={checked}
                  onClick={() => setAnswers({ ...answers, [i]: j })}
                  style={{
                    textAlign: "left", padding: "10px 12px", borderRadius: 9, fontSize: 13.5, fontFamily: "'Inter',sans-serif",
                    border: `2px solid ${isRight ? T.ok : isWrong ? T.danger : sel ? T.brand : T.line}`,
                    background: isRight ? T.okSoft : isWrong ? T.dangerSoft : sel ? T.brandSoft : "#fff",
                    color: T.ink, cursor: checked ? "default" : "pointer",
                  }}
                >
                  {op}
                </button>
              );
            })}
          </div>
          {checked && (
            <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.55, marginTop: 8, background: T.bg, borderRadius: 8, padding: "10px 12px" }}>
              {q.explain}
            </div>
          )}
        </div>
      ))}
      {!checked ? (
        <button
          className="sg-btn"
          disabled={!allAnswered}
          onClick={() => { setChecked(true); }}
          style={{ background: allAnswered ? T.brand : T.line, color: "#fff", padding: "10px 20px", fontSize: 14, marginTop: 16, cursor: allAnswered ? "pointer" : "not-allowed" }}
        >
          Revisar respuestas
        </button>
      ) : (
        <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Badge tone={correct === quiz.length ? "ok" : "warn"}>{correct} de {quiz.length} correctas</Badge>
          {correct === quiz.length ? (
            <button className="sg-btn" onClick={onPass} style={{ background: T.ok, color: "#fff", padding: "9px 18px", fontSize: 13 }}>
              Guardar y continuar
            </button>
          ) : (
            <button className="sg-btn" onClick={() => { setChecked(false); setAnswers({}); }} style={{ background: T.warn, color: "#fff", padding: "9px 18px", fontSize: 13 }}>
              Intentar de nuevo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Classes({ progress, setProgress }) {
  const [openModule, setOpenModule] = useState("m1");
  return (
    <div>
      <h2 className="sg-display" style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>Clases</h2>
      <p style={{ color: T.inkSoft, fontSize: 14, margin: "0 0 20px" }}>
        Cinco módulos cortos. Complete las lecciones y apruebe el quiz de cada módulo.
      </p>
      {MODULES.map((m) => {
        const lessonsDone = m.lessons.filter((l) => progress.lessons.has(l.id)).length;
        const quizDone = progress.quizzes.has(m.id);
        const pct = Math.round(((lessonsDone + (quizDone ? 1 : 0)) / (m.lessons.length + 1)) * 100);
        const open = openModule === m.id;
        return (
          <div key={m.id} className="sg-card" style={{ marginBottom: 14, padding: "18px 20px" }}>
            <button className="sg-nav" onClick={() => setOpenModule(open ? null : m.id)} style={{ width: "100%", textAlign: "left", padding: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <Badge tone={pct === 100 ? "ok" : "brand"}>{pct === 100 ? "Completado" : m.tag}</Badge>
                  <div className="sg-display" style={{ fontSize: 19, fontWeight: 800, marginTop: 8, color: T.ink }}>{m.title}</div>
                  <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 2 }}>
                    {m.lessons.length} {m.lessons.length === 1 ? "lección" : "lecciones"} + quiz · ~{m.minutes} min
                  </div>
                </div>
                <div style={{ minWidth: 130 }}>
                  <Progress pct={pct} tone={pct === 100 ? T.ok : T.brand} />
                  <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 4, textAlign: "right" }}>{pct}%</div>
                </div>
              </div>
            </button>
            {open && (
              <div style={{ marginTop: 6 }}>
                {m.lessons.map((l) => (
                  <Lesson
                    key={l.id}
                    lesson={l}
                    done={progress.lessons.has(l.id)}
                    onDone={() => {
                      const s = new Set(progress.lessons); s.add(l.id);
                      setProgress({ ...progress, lessons: s });
                    }}
                  />
                ))}
                <ModuleQuiz
                  quiz={m.quiz}
                  saved={quizDone}
                  onPass={() => {
                    const s = new Set(progress.quizzes); s.add(m.id);
                    setProgress({ ...progress, quizzes: s });
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------- SIMULADOR (estilo Outlook) -------------------- */

const OL = {
  blue: "#0F6CBD",
  blueDark: "#0C5AA0",
  blueSoft: "#EBF3FC",
  sel: "#CFE4FA",
  bg: "#FAF9F8",
  hover: "#F3F2F1",
  line: "#E1DFDD",
  text: "#242424",
  soft: "#616161",
  tipBg: "#FFF4CE",
  tipLine: "#F2C94C",
  font: "'Segoe UI', 'Segoe UI Web', -apple-system, 'Inter', sans-serif",
};

const AV_COLORS = ["#0F6CBD", "#CA5010", "#8764B8", "#038387", "#C239B3", "#498205", "#986F0B", "#D13438"];
const avColor = (name) => AV_COLORS[name.charCodeAt(0) % AV_COLORS.length];
const initials = (name) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

function FakeLink({ link }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ color: OL.blue, textDecoration: "underline", cursor: "pointer", wordBreak: "break-all" }}
        title="Toque para ver el destino real"
      >
        {link.text}
      </span>
      {show && (
        <span
          style={{
            position: "absolute", left: 0, bottom: "calc(100% + 6px)", zIndex: 20,
            background: "#242424", color: "#fff", borderRadius: 6, padding: "10px 12px",
            fontSize: 12, lineHeight: 1.5, width: 250, maxWidth: "78vw",
            boxShadow: "0 6px 18px rgba(0,0,0,.3)", whiteSpace: "normal", fontFamily: OL.font,
          }}
        >
          <span style={{ display: "block", color: "#F2C94C", fontWeight: 700, fontSize: 11, letterSpacing: ".05em" }}>
            ⚠ DESTINO REAL DEL ENLACE
          </span>
          <span className="sg-mono" style={{ display: "block", color: "#FF9C93", marginTop: 4, wordBreak: "break-all", fontSize: 11.5 }}>
            {link.dest}
          </span>
          <span style={{ display: "block", marginTop: 6, color: "#D6D6D6" }}>
            En su correo real: mantenga presionado el enlace (celular) o pase el cursor (computadora) antes de decidir.
          </span>
        </span>
      )}
    </span>
  );
}

const renderBody = (email) => {
  if (!email.link) return email.body;
  const parts = email.body.split(email.link.text);
  return (
    <>
      {parts[0]}
      <FakeLink link={email.link} />
      {parts[1]}
    </>
  );
};

const Avatar = ({ name, size = 36 }) => (
  <span
    style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: avColor(name), color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 600, fontFamily: OL.font,
    }}
  >
    {initials(name)}
  </span>
);

function Simulator({ simState, setSimState }) {
  const [selected, setSelected] = useState(SIM_EMAILS[0].id);
  const [paneOpen, setPaneOpen] = useState(false);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px)");
    const upd = () => setNarrow(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);
  const showList = !narrow || !paneOpen;
  const showPane = !narrow || paneOpen;
  const [streak, setStreak] = useState(0);
  const email = SIM_EMAILS.find((e) => e.id === selected);
  const verdict = simState[email.id]; // undefined | "phish" | "legit"
  const answered = Object.keys(simState).length;
  const correct = SIM_EMAILS.filter((e) => simState[e.id] === (e.phish ? "phish" : "legit")).length;
  const unreadCount = SIM_EMAILS.length - answered;

  const decide = (v) => {
    setSimState({ ...simState, [email.id]: v });
    setStreak(v === (email.phish ? "phish" : "legit") ? streak + 1 : 0);
  };
  const isCorrect = verdict !== undefined && verdict === (email.phish ? "phish" : "legit");

  const cmdBtn = (label, opts = {}) => (
    <button
      className="sg-nav ol-cmd"
      onClick={opts.onClick}
      disabled={opts.disabled}
      title={opts.title || label}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 10px", borderRadius: 4, fontSize: 13, fontFamily: OL.font,
        color: opts.color || OL.text, fontWeight: opts.bold ? 600 : 400,
        opacity: opts.disabled ? 0.45 : 1, cursor: opts.disabled ? "default" : "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <p style={{ color: T.inkSoft, fontSize: 14, margin: 0, flex: "1 1 260px" }}>
          Una bandeja como la de su oficina. Revise cada correo y use <b>Reportar phishing</b> o <b>Es legítimo</b> en la barra de comandos.
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {streak >= 2 && <Badge tone="warn">🔥 Racha de {streak}</Badge>}
          <Badge tone={answered === SIM_EMAILS.length ? (correct >= 8 ? "ok" : "warn") : "brand"}>
            {answered}/{SIM_EMAILS.length} revisados · {correct} aciertos
          </Badge>
        </div>
      </div>

      {/* ------ Ventana estilo Outlook ------ */}
      <div style={{ border: `1px solid ${OL.line}`, borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,.08)", fontFamily: OL.font }}>

        {/* Barra superior azul */}
        <div style={{ background: OL.blue, display: "flex", alignItems: "center", gap: 12, padding: "8px 14px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 600, fontSize: 15 }}>
            <span style={{ background: "#fff", color: OL.blue, borderRadius: 4, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>O</span>
            Outlook
          </span>
          <div style={{ flex: 1, maxWidth: 420, margin: "0 auto" }}>
            <div style={{ background: "#fff", borderRadius: 4, padding: "5px 12px", fontSize: 13, color: OL.soft, display: "flex", gap: 8, alignItems: "center" }}>
              <span>🔍</span> Buscar
            </div>
          </div>
          <Avatar name="Usted Colaborador" size={28} />
        </div>

        {/* Barra de comandos */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "6px 10px", borderBottom: `1px solid ${OL.line}`, background: "#fff", overflowX: "auto" }}>
          <button className="sg-nav" style={{ background: OL.blue, color: "#fff", borderRadius: 4, padding: "6px 14px", fontSize: 13, fontWeight: 600, fontFamily: OL.font, whiteSpace: "nowrap" }}>
            ✉ Correo nuevo
          </button>
          <span style={{ width: 1, height: 22, background: OL.line, margin: "0 8px" }} />
          {cmdBtn("🛡 Reportar phishing", {
            onClick: () => verdict === undefined && decide("phish"),
            disabled: verdict !== undefined,
            color: "#B10E1C", bold: true,
            title: "Marcar el correo seleccionado como phishing",
          })}
          {cmdBtn("✓ Es legítimo", {
            onClick: () => verdict === undefined && decide("legit"),
            disabled: verdict !== undefined,
            color: "#107C10", bold: true,
            title: "Marcar el correo seleccionado como seguro",
          })}
        </div>

        <div style={{ display: "flex", minHeight: 480 }}>

          {/* Panel de carpetas */}
          <div className="ol-folders" style={{ width: 176, flexShrink: 0, background: OL.bg, borderRight: `1px solid ${OL.line}`, padding: "10px 6px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: OL.soft, padding: "4px 10px" }}>Favoritos</div>
            {[
              ["📥", "Bandeja de entrada", unreadCount > 0 ? unreadCount : null, true],
              ["📤", "Enviados", null, false],
              ["📄", "Borradores", 2, false],
              ["🚫", "No deseado", null, false],
              ["🗑", "Eliminados", null, false],
            ].map(([ic, label, count, active]) => (
              <div
                key={label}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                  borderRadius: 4, fontSize: 13.5, marginTop: 1,
                  background: active ? OL.sel : "transparent",
                  fontWeight: active ? 600 : 400, color: OL.text,
                  borderLeft: active ? `3px solid ${OL.blue}` : "3px solid transparent",
                }}
              >
                <span style={{ fontSize: 13 }}>{ic}</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                {count !== null && <span style={{ fontSize: 12, fontWeight: 600, color: OL.blue }}>{count}</span>}
              </div>
            ))}
          </div>

          {/* Lista de mensajes */}
          {showList && (
          <div style={{ width: narrow ? "100%" : 300, flexShrink: 0, borderRight: narrow ? "none" : `1px solid ${OL.line}`, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={{ display: "flex", borderBottom: `1px solid ${OL.line}`, padding: "0 12px", gap: 16 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: OL.blue, borderBottom: `2px solid ${OL.blue}`, padding: "9px 2px" }}>Prioritarios</span>
              <span style={{ fontSize: 13.5, color: OL.soft, padding: "9px 2px" }}>Otros</span>
            </div>
            <div style={{ overflowY: "auto", maxHeight: 470 }}>
              {SIM_EMAILS.map((e) => {
                const v = simState[e.id];
                const done = v !== undefined;
                const ok = done && v === (e.phish ? "phish" : "legit");
                const isSel = selected === e.id;
                return (
                  <button
                    key={e.id}
                    className="sg-nav ol-item"
                    onClick={() => { setSelected(e.id); setPaneOpen(true); }}
                    style={{
                      width: "100%", textAlign: "left", display: "flex", gap: 10,
                      padding: "10px 12px 10px 9px", fontFamily: OL.font,
                      background: isSel ? OL.sel : "transparent",
                      borderLeft: `3px solid ${isSel ? OL.blue : "transparent"}`,
                      borderBottom: `1px solid ${OL.line}`,
                    }}
                  >
                    <Avatar name={e.from} size={34} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                        <span style={{ fontSize: 13.5, fontWeight: done ? 400 : 700, color: OL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {e.from}
                        </span>
                        <span style={{ fontSize: 11.5, color: done ? OL.soft : OL.blue, fontWeight: done ? 400 : 600, flexShrink: 0 }}>{e.time}</span>
                      </span>
                      <span style={{ display: "block", fontSize: 12.5, fontWeight: done ? 400 : 600, color: done ? OL.soft : OL.blue, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                        {e.subject}
                      </span>
                      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginTop: 1 }}>
                        <span style={{ fontSize: 12, color: OL.soft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {e.body.split("\n")[0]}
                        </span>
                        {done && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, flexShrink: 0, color: "#fff", background: ok ? "#107C10" : "#B10E1C", borderRadius: 999, padding: "1px 7px" }}>
                            {ok ? "✓" : "✗"}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          )}

          {/* Panel de lectura */}
          {showPane && (
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#fff" }}>
            <div style={{ padding: narrow ? "10px 16px 0" : "16px 20px 0" }}>
              {narrow && (
                <button
                  className="sg-nav"
                  onClick={() => setPaneOpen(false)}
                  style={{ color: OL.blue, fontSize: 14, fontWeight: 600, fontFamily: OL.font, padding: "6px 0", display: "flex", alignItems: "center", gap: 6 }}
                >
                  ← Bandeja de entrada
                </button>
              )}
              <div style={{ fontSize: 19, fontWeight: 600, color: OL.text, lineHeight: 1.3 }}>{email.subject}</div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 14, paddingBottom: 12, borderBottom: `1px solid ${OL.line}` }}>
                <Avatar name={email.from} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: OL.text }}>
                    {email.from}{" "}
                    <span style={{ fontWeight: 400, color: OL.soft, fontSize: 13, wordBreak: "break-all" }}>
                      &lt;{email.addr}&gt;
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: OL.soft, marginTop: 2 }}>Para: Usted</div>
                </div>
                <div style={{ fontSize: 12, color: OL.soft, flexShrink: 0 }}>dom 02/08 {email.time}</div>
              </div>
            </div>

            <div style={{ padding: "4px 20px 20px", flex: 1, overflowY: "auto" }}>
              {verdict === undefined && (
                <div style={{ background: OL.tipBg, border: `1px solid ${OL.tipLine}`, borderRadius: 4, padding: "9px 12px", fontSize: 13, color: "#5D4E12", margin: "12px 0 4px", display: "flex", gap: 8, alignItems: "center" }}>
                  <span>💡</span>
                  <span><b>Ejercicio:</b> lea el correo — puede tocar los enlaces azules para ver su destino real — y decida con los botones de arriba: <b>Reportar phishing</b> o <b>Es legítimo</b>.</span>
                </div>
              )}

              <pre style={{ fontFamily: OL.font, fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap", margin: "14px 0", color: OL.text }}>
                {renderBody(email)}
              </pre>

              {verdict !== undefined && (
                <div style={{ borderLeft: `4px solid ${isCorrect ? "#107C10" : "#B10E1C"}`, background: isCorrect ? "#F1FAF1" : "#FDF3F4", borderRadius: "0 6px 6px 0", padding: "13px 16px" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: isCorrect ? "#107C10" : "#B10E1C" }}>
                    {isCorrect ? "✓ Correcto." : "✗ Cuidado."} Este correo {email.phish ? "ES PHISHING" : "es legítimo"}.
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".05em", color: OL.soft, marginTop: 10 }}>
                    {email.phish ? "SEÑALES DE ALERTA" : "POR QUÉ ES CONFIABLE"}
                  </div>
                  {email.clues.map((c, i) => (
                    <div key={i} style={{ fontSize: 13.5, lineHeight: 1.55, marginTop: 6, display: "flex", gap: 8 }}>
                      <span style={{ color: email.phish ? "#B10E1C" : "#107C10", fontWeight: 700 }}>{email.phish ? "▲" : "●"}</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {answered === SIM_EMAILS.length && (
        <div className="sg-card" style={{ marginTop: 16, padding: "18px 22px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", borderColor: correct >= 8 ? T.ok : T.warn }}>
          <div className="sg-display" style={{ fontSize: 32, fontWeight: 800, color: correct >= 8 ? T.ok : T.warn }}>
            {correct * 10}%
          </div>
          <div style={{ flex: 1, minWidth: 220, fontSize: 14, lineHeight: 1.55 }}>
            {correct >= 8
              ? "Excelente ojo. Está listo para la evaluación final."
              : "Buen intento. Repase el Módulo 2 (anatomía del correo) y vuelva a intentarlo."}
          </div>
          <button className="sg-btn" onClick={() => setSimState({})} style={{ background: T.surface, color: T.brand, border: `2px solid ${T.brand}`, padding: "10px 18px", fontSize: 13 }}>
            Reiniciar simulador
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------- EVALUACIÓN -------------------------- */

function Exam({ examResult, setExamResult }) {
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const allAnswered = EXAM.every((_, i) => answers[i] !== undefined);

  if (examResult) {
    const passed = examResult.score >= 80;
    return (
      <div>
        <h2 className="sg-display" style={{ fontSize: 28, fontWeight: 800, margin: "0 0 16px" }}>Resultado</h2>
        {passed ? (
          <div className="sg-card" style={{ padding: 0, overflow: "hidden", maxWidth: 640, margin: "0 auto", border: `2px solid ${T.brand}` }}>
            <div style={{ background: T.chipBg, padding: "26px 30px", textAlign: "center" }}>
              <div className="sg-mono" style={{ color: T.chipTx, fontSize: 12, letterSpacing: ".2em" }}>CERTIFICADO DE APROBACIÓN</div>
              <div className="sg-display" style={{ color: "#fff", fontSize: 26, fontWeight: 800, marginTop: 8 }}>
                Detección de Phishing para Pymes
              </div>
            </div>
            <div style={{ padding: "26px 30px", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: T.inkSoft }}>Se certifica que</div>
              <div className="sg-display" style={{ fontSize: 24, fontWeight: 800, margin: "6px 0", borderBottom: `2px solid ${T.line}`, display: "inline-block", padding: "0 20px 6px" }}>
                {examResult.name || "Colaborador(a)"}
              </div>
              <div style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.6, marginTop: 8 }}>
                completó la capacitación y aprobó la evaluación final con una nota de
              </div>
              <div className="sg-display" style={{ fontSize: 44, fontWeight: 800, color: T.ok }}>{examResult.score}%</div>
              <div className="sg-mono" style={{ fontSize: 11, color: T.inkSoft, marginTop: 10 }}>
                Emitido: agosto 2026 · Válido por 12 meses · ID: SG-{String(Math.floor(1000 + examResult.score * 7))}
              </div>
              <div style={{ marginTop: 18 }}>
                <button className="sg-btn" onClick={() => setExamResult(null)} style={{ background: T.surface, color: T.brand, border: `2px solid ${T.brand}`, padding: "10px 18px", fontSize: 13 }}>
                  Repetir evaluación
                </button>
              </div>
              <p style={{ fontSize: 11.5, color: T.inkSoft, marginTop: 12 }}>
                (En la versión final, este certificado se descargará como PDF)
              </p>
            </div>
          </div>
        ) : (
          <div className="sg-card" style={{ padding: 26, maxWidth: 560, borderColor: T.warn }}>
            <div className="sg-display" style={{ fontSize: 34, fontWeight: 800, color: T.warn }}>{examResult.score}%</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6 }}>
              Se necesita 80% para aprobar. Repase las clases — en especial los módulos 2 y 3 — y vuelva a intentarlo. La evaluación se puede repetir las veces necesarias.
            </p>
            <button className="sg-btn" onClick={() => setExamResult(null)} style={{ background: T.brand, color: "#fff", padding: "11px 20px", fontSize: 14 }}>
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="sg-display" style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>Evaluación final</h2>
      <p style={{ color: T.inkSoft, fontSize: 14, margin: "0 0 18px" }}>
        10 preguntas · se aprueba con 80% · genera certificado.
      </p>
      <div className="sg-card" style={{ padding: "16px 20px", marginBottom: 14 }}>
        <label className="sg-display" style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>
          Nombre para el certificado
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. María López"
          style={{ width: "100%", maxWidth: 340, padding: "10px 12px", borderRadius: 9, border: `1.5px solid ${T.line}`, fontSize: 14, fontFamily: "'Inter',sans-serif" }}
        />
      </div>
      {EXAM.map((q, i) => (
        <div key={i} className="sg-card" style={{ padding: "16px 20px", marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.5 }}>{i + 1}. {q.q}</div>
          <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
            {q.options.map((op, j) => (
              <button
                key={j}
                className="sg-nav"
                onClick={() => setAnswers({ ...answers, [i]: j })}
                style={{
                  textAlign: "left", padding: "10px 12px", borderRadius: 9, fontSize: 13.5, fontFamily: "'Inter',sans-serif",
                  border: `2px solid ${answers[i] === j ? T.brand : T.line}`,
                  background: answers[i] === j ? T.brandSoft : "#fff", color: T.ink,
                }}
              >
                {op}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        className="sg-btn"
        disabled={!allAnswered}
        onClick={() => {
          const correct = EXAM.filter((q, i) => answers[i] === q.answer).length;
          setExamResult({ score: correct * 10, name });
        }}
        style={{ background: allAnswered ? T.brand : T.line, color: "#fff", padding: "13px 26px", fontSize: 15, cursor: allAnswered ? "pointer" : "not-allowed" }}
      >
        Entregar evaluación
      </button>
      {!allAnswered && <p style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 8 }}>Responda las 10 preguntas para entregar.</p>}
    </div>
  );
}

/* ---------------- SIMULACRO SMS / WHATSAPP (smishing) ---------------- */

const SMS_MSGS = [
  {
    id: 101,
    from: "+502 4477 9012",
    name: "Lic. Morales (¿jefe?)",
    app: "WhatsApp",
    time: "08:40",
    body: "Hola, soy el Lic. Morales, gerente general. Este es mi número personal. Estoy en reunión con un cliente importante y necesito que compres 3 tarjetas de regalo de Q500 c/u para un obsequio. Es urgente y confidencial, no lo comentes todavía. Guarda las facturas y te reembolso.",
    phish: true,
    clues: [
      "Número desconocido que dice ser el jefe: suplantación clásica dirigida a colaboradores",
      "Urgencia + secretismo + tarjetas de regalo: el trío del fraude del CEO en versión WhatsApp",
      "Defensa: escribir o llamar al gerente a su número de siempre antes de gastar un centavo",
    ],
  },
  {
    id: 102,
    from: "+502 3311 8842",
    name: "BANCO EMPRESAS",
    app: "SMS",
    time: "09:15",
    body: "BANCO EMPRESARIAL: El token de la cuenta de su empresa sera desactivado hoy. Sincronicelo de inmediato en:",
    link: { text: "http://banca-empresas-gt.net/token", dest: "http://banca-empresas-gt.net/token/login.php" },
    phish: true,
    clues: [
      "Los bancos no desactivan tokens empresariales por SMS ni piden sincronizarlos por enlaces",
      "Dominio inventado: banca-empresas-gt.net no es el dominio oficial del banco",
      "Objetivo real: las credenciales de la banca en línea de la empresa",
    ],
  },
  {
    id: 103,
    from: "+502 5901 3376",
    name: "Soporte TI (¿?)",
    app: "WhatsApp",
    time: "10:02",
    body: "Hola 👋 soy Kevin, del soporte de TI de la empresa. Estamos migrando los correos al nuevo servidor. Te va a llegar un código por SMS en un momento, ¿me lo pasas por aquí para validar tu cuenta y que no pierdas tus correos?",
    phish: true,
    clues: [
      "Nadie de TI necesita el código que llega a SU teléfono: ese código es la llave de su cuenta",
      "Si pide el código, es porque en este momento está intentando entrar con su usuario",
      "Defensa: no compartir y verificar con TI por el canal oficial de la empresa",
    ],
  },
  {
    id: 104,
    from: "22887",
    name: "Verificación",
    app: "SMS",
    time: "10:03",
    body: "Su codigo para iniciar sesion en el correo corporativo es 493-210. Vence en 10 minutos. NUNCA comparta este codigo con nadie, ni siquiera con soporte tecnico.",
    phish: false,
    clues: [
      "Mensaje automático legítimo del sistema de la empresa",
      "La trampa está en el chat anterior: «Kevin de TI» lo está esperando para pedírselo",
      "Regla absoluta: los códigos no se comparten con nadie, ni con TI, ni con el banco",
    ],
  },
  {
    id: 105,
    from: "+502 4587 2210",
    name: "Distribuidora El Progreso",
    app: "WhatsApp",
    time: "13:25",
    body: "Buen día, le escribe el depto. de créditos de Distribuidora El Progreso. Le informamos que cambiamos de banco: el pago de la factura #2231 (Q18,750) deposítelo a la cuenta 019-004412-8 del nuevo banco. Adjuntamos carta membretada. Quedamos atentos 🙏",
    phish: true,
    clues: [
      "Cambio de cuenta bancaria notificado por WhatsApp: patrón BEC dirigido a contabilidad",
      "La «carta membretada» se falsifica en minutos; no es prueba de nada",
      "Defensa: llamar al proveedor al número de siempre y aplicar la política de doble confirmación",
    ],
  },
  {
    id: 106,
    from: "RRHH",
    name: "Recursos Humanos",
    app: "SMS",
    time: "16:30",
    body: "RRHH: Recordatorio, manana viernes vence la entrega de constancias en la oficina, horario normal. Consultas en la extension 105.",
    phish: false,
    clues: [
      "Informa sin pedir: no hay enlaces, datos, códigos ni pagos",
      "Verificable en persona dentro de la empresa o en la extensión conocida",
      "Remitente corporativo corto, consistente con avisos internos anteriores",
    ],
  },
];


const WA = {
  green: "#008069",
  greenDark: "#075E54",
  chatBg: "#ECE5DD",
  bubble: "#FFFFFF",
  system: "#FCF4CB",
  text: "#111B21",
  soft: "#667781",
  check: "#53BDEB",
  font: "'Segoe UI', -apple-system, 'Inter', sans-serif",
};

function SmsSim({ smsState, setSmsState }) {
  const [openChat, setOpenChat] = useState(null);
  const msg = SMS_MSGS.find((m) => m.id === openChat);
  const answered = Object.keys(smsState).length;
  const correct = SMS_MSGS.filter((m) => smsState[m.id] === (m.phish ? "phish" : "legit")).length;
  const verdict = msg ? smsState[msg.id] : undefined;
  const isCorrect = msg && verdict !== undefined && verdict === (msg.phish ? "phish" : "legit");
  const decide = (v) => setSmsState({ ...smsState, [msg.id]: v });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <p style={{ color: T.inkSoft, fontSize: 14, margin: 0, flex: "1 1 260px" }}>
          El fraude también llega al teléfono del trabajo: falsos jefes, soporte TI y proveedores. Abra cada chat y decida si es <b>fraude</b> o <b>legítimo</b>.
        </p>
        <Badge tone={answered === SMS_MSGS.length ? (correct >= 5 ? "ok" : "warn") : "brand"}>
          {answered}/{SMS_MSGS.length} revisados · {correct} aciertos
        </Badge>
      </div>

      {/* Marco de teléfono */}
      <div style={{ maxWidth: 390, margin: "0 auto", border: "10px solid #1C1C1E", borderRadius: 34, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,.22)", background: "#fff", fontFamily: WA.font }}>
        {msg === undefined || msg === null ? (
          <>
            {/* Lista de chats */}
            <div style={{ background: WA.green, color: "#fff", padding: "16px 18px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 19, fontWeight: 700 }}>Mensajes</span>
                <span style={{ fontSize: 16, letterSpacing: 3 }}>🔍 ⋮</span>
              </div>
            </div>
            <div style={{ minHeight: 430 }}>
              {SMS_MSGS.map((m) => {
                const v = smsState[m.id];
                const done = v !== undefined;
                const ok = done && v === (m.phish ? "phish" : "legit");
                return (
                  <button
                    key={m.id}
                    className="sg-nav ol-item"
                    onClick={() => setOpenChat(m.id)}
                    style={{ width: "100%", display: "flex", gap: 12, alignItems: "center", padding: "11px 14px", textAlign: "left", borderBottom: "1px solid #F0F2F5", fontFamily: WA.font }}
                  >
                    <Avatar name={m.name} size={44} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: done ? 500 : 700, color: WA.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.name}
                        </span>
                        <span style={{ fontSize: 11.5, color: done ? WA.soft : WA.green, fontWeight: done ? 400 : 700, flexShrink: 0 }}>{m.time}</span>
                      </span>
                      <span style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: 13, color: WA.soft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.app === "WhatsApp" ? "💬 " : "✉ "}{m.body}
                        </span>
                        {done ? (
                          <span style={{ fontSize: 10.5, fontWeight: 700, flexShrink: 0, color: "#fff", background: ok ? "#107C10" : "#B10E1C", borderRadius: 999, padding: "1px 7px" }}>
                            {ok ? "✓" : "✗"}
                          </span>
                        ) : (
                          <span style={{ width: 18, height: 18, borderRadius: "50%", background: WA.green, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>1</span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Conversación */}
            <div style={{ background: WA.green, color: "#fff", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <button className="sg-nav" onClick={() => setOpenChat(null)} style={{ color: "#fff", fontSize: 20, padding: "0 4px" }} title="Volver a mensajes">←</button>
              <Avatar name={msg.name} size={34} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.name}</span>
                <span style={{ display: "block", fontSize: 11.5, opacity: 0.85 }}>{msg.from} · {msg.app}</span>
              </span>
            </div>
            <div style={{ background: WA.chatBg, minHeight: 430, padding: "14px 12px", display: "flex", flexDirection: "column" }}>
              <div style={{ alignSelf: "center", background: WA.system, borderRadius: 8, fontSize: 11, color: "#54656F", padding: "5px 10px", textAlign: "center", maxWidth: "90%" }}>
                🔒 Ejercicio: lea el mensaje{msg.link ? " — toque el enlace azul para ver su destino real —" : ""} y decida abajo.
              </div>
              <div style={{ alignSelf: "flex-start", background: WA.bubble, borderRadius: "0 12px 12px 12px", padding: "9px 12px", marginTop: 12, maxWidth: "85%", boxShadow: "0 1px 1px rgba(0,0,0,.08)" }}>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: WA.text }}>
                  {msg.body}{" "}
                  {msg.link && <FakeLink link={msg.link} />}
                </div>
                <div style={{ fontSize: 10.5, color: WA.soft, textAlign: "right", marginTop: 3 }}>{msg.time}</div>
              </div>

              {verdict !== undefined && (
                <div style={{ alignSelf: "center", background: isCorrect ? "#E4F2EA" : "#FBEAE8", border: `1.5px solid ${isCorrect ? "#25794F" : "#C0392F"}`, borderRadius: 12, padding: "11px 13px", marginTop: 14, maxWidth: "94%" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: isCorrect ? "#25794F" : "#C0392F" }}>
                    {isCorrect ? "✓ Correcto." : "✗ Cuidado."} Este mensaje {msg.phish ? "ES FRAUDE" : "es legítimo"}.
                  </div>
                  {msg.clues.map((c, i) => (
                    <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 5, display: "flex", gap: 7 }}>
                      <span style={{ color: msg.phish ? "#C0392F" : "#25794F", fontWeight: 700 }}>{msg.phish ? "▲" : "●"}</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ flex: 1 }} />
            </div>
            {/* Barra de decisión (en lugar del campo de texto) */}
            <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#F0F2F5" }}>
              {verdict === undefined ? (
                <>
                  <button className="sg-btn" onClick={() => decide("phish")} style={{ flex: 1, background: "#B10E1C", color: "#fff", padding: "11px 8px", fontSize: 13.5, borderRadius: 999 }}>
                    🚩 Es fraude
                  </button>
                  <button className="sg-btn" onClick={() => decide("legit")} style={{ flex: 1, background: WA.green, color: "#fff", padding: "11px 8px", fontSize: 13.5, borderRadius: 999 }}>
                    ✓ Es legítimo
                  </button>
                </>
              ) : (
                <button className="sg-btn" onClick={() => setOpenChat(null)} style={{ flex: 1, background: "#fff", color: WA.green, border: `2px solid ${WA.green}`, padding: "10px 8px", fontSize: 13.5, borderRadius: 999 }}>
                  ← Volver a mensajes
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {answered === SMS_MSGS.length && (
        <div className="sg-card" style={{ marginTop: 16, padding: "18px 22px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", borderColor: correct >= 5 ? T.ok : T.warn, maxWidth: 640, margin: "16px auto 0" }}>
          <div className="sg-display" style={{ fontSize: 32, fontWeight: 800, color: correct >= 5 ? T.ok : T.warn }}>
            {Math.round((correct / SMS_MSGS.length) * 100)}%
          </div>
          <div style={{ flex: 1, minWidth: 200, fontSize: 14, lineHeight: 1.55 }}>
            {correct >= 5
              ? "Muy bien: el fraude por teléfono no lo va a sorprender."
              : "Repase el Módulo 1 (tipos de phishing) y vuelva a intentarlo."}
          </div>
          <button className="sg-btn" onClick={() => { setSmsState({}); setOpenChat(null); }} style={{ background: T.surface, color: T.brand, border: `2px solid ${T.brand}`, padding: "10px 18px", fontSize: 13 }}>
            Reiniciar
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------- SIMULACRO LLAMADA (vishing) ------------------- */

const CALL_SCRIPT = [
  {
    caller:
      "Buenas tardes, le llamo de banca empresarial de su banco. Detectamos una transferencia sospechosa por Q48,500 saliendo de la cuenta de su empresa hace unos minutos. Usted aparece como usuario autorizado, ¿la reconoce?",
    options: [
      { text: "No la reconozco… ¿qué tengo que hacer?", tone: "neutral", fb: "Respuesta natural, pero ya le confirmó al estafador que usted maneja la banca de la empresa y que está asustado. Mejor: no confirmar nada." },
      { text: "¿De qué agencia me llama? Cuelgo y devuelvo la llamada al número oficial del banco.", tone: "safe", fb: "Perfecto. Devolver la llamada al número oficial rompe el fraude por completo: el estafador no puede recibirla." },
      { text: "Déjeme darle el número de cuenta de la empresa para que verifique.", tone: "risky", fb: "Nunca. El banco ya conoce las cuentas de la empresa; quien las pide es porque NO las tiene. Acaba de entregar un dato clave." },
    ],
  },
  {
    caller:
      "Entiendo, no se preocupe, para eso estamos. Para bloquear la operación necesito validar su acceso en el sistema. ¿Me confirma su usuario de la banca empresarial?",
    options: [
      { text: "Mi usuario es… (se lo dicta)", tone: "risky", fb: "Con el usuario, al estafador solo le falta el código del siguiente paso para entrar a la banca de la empresa." },
      { text: "El banco no pide usuarios por teléfono. ¿Por qué lo necesita?", tone: "safe", fb: "Correcto: cuestionar el guion descoloca al estafador. Los bancos verifican con lo que ELLOS ya tienen, no pidiéndole sus credenciales." },
      { text: "Solo le confirmo el nombre de la empresa.", tone: "neutral", fb: "Menos malo, pero sigue el juego del atacante. La respuesta segura es no dar nada, colgar y avisar." },
    ],
  },
  {
    caller:
      "Gracias. Ahora genere el código de su token — o léame el que le acaba de llegar por SMS — para cancelar la transferencia antes de que se haga efectiva.",
    options: [
      { text: "Ok, el código es 4-9-3…", tone: "risky", fb: "Este es EL momento del fraude: ese código es la llave que el estafador necesita para autorizar la salida de dinero de la EMPRESA. Dictarlo = entregar la cuenta." },
      { text: "Los códigos del token no se comparten con nadie. Ni con el banco.", tone: "safe", fb: "Exacto. Si alguien pide un código o token por teléfono, la llamada ES el fraude — sin excepciones." },
      { text: "¿Y para qué necesita el código si usted es del banco?", tone: "neutral", fb: "Buena pregunta — la respuesta es que NO lo necesitaría. Pero mejor que preguntar es cortar: no compartir, colgar y avisar." },
    ],
  },
  {
    caller:
      "Le pido que colabore. Si no completamos la verificación EN ESTE MOMENTO, la transferencia saldrá de la cuenta, su empresa perderá el dinero y usted quedará como responsable ante su gerencia. ¿Entiende la gravedad?",
    options: [
      { text: "Está bien, está bien… dígame qué hago.", tone: "risky", fb: "Amenazar con «usted será el responsable» es presión dirigida al colaborador. Ceder aquí entrega todo lo anterior." },
      { text: "Voy a colgar, avisar a mi jefe y a TI, y llamar al banco al número oficial.", tone: "safe", fb: "La jugada ganadora, en ese orden. Si la transferencia sospechosa existiera, el banco real se lo confirmará por su canal oficial — y avisar internamente protege a toda la empresa." },
      { text: "Páseme con su supervisor.", tone: "neutral", fb: "El «supervisor» será otro estafador del mismo cuarto. No negocie: cuelgue, avise y llame usted al número oficial." },
    ],
  },
];


function CallSim() {
  const [stage, setStage] = useState("ringing"); // ringing | call | done
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]); // {caller, chosen, tone, fb}
  const safeCount = history.filter((h) => h.tone === "safe").length;

  const choose = (op) => {
    const h = [...history, { caller: CALL_SCRIPT[step].caller, chosen: op.text, tone: op.tone, fb: op.fb }];
    setHistory(h);
    if (step + 1 < CALL_SCRIPT.length) setStep(step + 1);
    else setStage("done");
  };

  const reset = () => { setStage("ringing"); setStep(0); setHistory([]); };
  const toneColor = (t) => (t === "safe" ? "#25794F" : t === "risky" ? "#C0392F" : "#B97A12");
  const toneLabel = (t) => (t === "safe" ? "✓ Decisión segura" : t === "risky" ? "✗ Decisión riesgosa" : "⚠ Se puede mejorar");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <p style={{ color: T.inkSoft, fontSize: 14, margin: 0, flex: "1 1 260px" }}>
          Una llamada del «banco» sobre la cuenta de su empresa. Elija qué responder — cada decisión cuenta.
        </p>
        <Badge tone={stage === "done" ? (safeCount >= 3 ? "ok" : "warn") : "brand"}>
          {stage === "done" ? `${safeCount}/${CALL_SCRIPT.length} decisiones seguras` : `Decisión ${Math.min(history.length + 1, CALL_SCRIPT.length)} de ${CALL_SCRIPT.length}`}
        </Badge>
      </div>

      <div style={{ maxWidth: 390, margin: "0 auto", border: "10px solid #1C1C1E", borderRadius: 34, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,.22)", background: "#111", fontFamily: WA.font }}>

        {stage === "ringing" && (
          <div style={{ minHeight: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "48px 24px 40px", background: "linear-gradient(180deg, #1B2A32 0%, #0D1418 100%)", color: "#fff", textAlign: "center" }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>Llamada entrante…</div>
              <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
                <Avatar name="Banco Seguridad" size={84} />
              </div>
              <div style={{ fontSize: 21, fontWeight: 700, marginTop: 14 }}>Banco — Banca Empresarial</div>
              <div style={{ fontSize: 14, opacity: 0.75, marginTop: 4 }}>+502 2419 0088</div>
              <div style={{ fontSize: 11.5, opacity: 0.55, marginTop: 10, maxWidth: 240, margin: "10px auto 0", lineHeight: 1.5 }}>
                Nota del ejercicio: el número puede verse «oficial» — el identificador de llamadas se puede falsificar.
              </div>
            </div>
            <div style={{ display: "flex", gap: 56 }}>
              <button className="sg-btn" onClick={reset} style={{ width: 62, height: 62, borderRadius: "50%", background: "#D64545", color: "#fff", fontSize: 24 }} title="Rechazar">✕</button>
              <button className="sg-btn" onClick={() => setStage("call")} style={{ width: 62, height: 62, borderRadius: "50%", background: "#25A85B", color: "#fff", fontSize: 24 }} title="Contestar">📞</button>
            </div>
          </div>
        )}

        {stage === "call" && (
          <div style={{ background: WA.chatBg, display: "flex", flexDirection: "column", minHeight: 500 }}>
            <div style={{ background: "#1B2A32", color: "#fff", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name="Banco Seguridad" size={32} />
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>Banco — Seguridad</span>
                <span style={{ display: "block", fontSize: 11, opacity: 0.75 }}>🔴 En llamada · 0{Math.floor((history.length + 1) * 0.7)}:{String((history.length * 23 + 12) % 60).padStart(2, "0")}</span>
              </span>
            </div>

            <div style={{ flex: 1, padding: "12px 12px 4px", overflowY: "auto", maxHeight: 330 }}>
              {history.map((h, i) => (
                <div key={i}>
                  <div style={{ background: WA.bubble, borderRadius: "0 12px 12px 12px", padding: "8px 11px", maxWidth: "88%", fontSize: 13, lineHeight: 1.5, color: WA.text, marginTop: 8, boxShadow: "0 1px 1px rgba(0,0,0,.08)" }}>
                    🗣 {h.caller}
                  </div>
                  <div style={{ background: "#D9FDD3", borderRadius: "12px 0 12px 12px", padding: "8px 11px", maxWidth: "88%", fontSize: 13, lineHeight: 1.5, color: WA.text, marginTop: 8, marginLeft: "auto" }}>
                    {h.chosen}
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: toneColor(h.tone), textAlign: "right", marginTop: 3 }}>
                    {toneLabel(h.tone)}
                  </div>
                </div>
              ))}
              <div style={{ background: WA.bubble, borderRadius: "0 12px 12px 12px", padding: "8px 11px", maxWidth: "88%", fontSize: 13, lineHeight: 1.5, color: WA.text, marginTop: 8, boxShadow: "0 1px 1px rgba(0,0,0,.08)" }}>
                🗣 {CALL_SCRIPT[step].caller}
              </div>
            </div>

            <div style={{ background: "#F0F2F5", padding: "10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: WA.soft, letterSpacing: ".05em", marginBottom: 6 }}>¿QUÉ RESPONDE?</div>
              {CALL_SCRIPT[step].options.map((op, i) => (
                <button
                  key={i}
                  className="sg-nav ol-item"
                  onClick={() => choose(op)}
                  style={{ width: "100%", textAlign: "left", background: "#fff", border: `1.5px solid ${WA.green}`, borderRadius: 12, padding: "9px 12px", fontSize: 13, lineHeight: 1.45, color: WA.text, marginTop: 6, fontFamily: WA.font }}
                >
                  {op.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === "done" && (
          <div style={{ background: "#fff", minHeight: 500, padding: "22px 18px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: WA.soft }}>Llamada finalizada</div>
              <div className="sg-display" style={{ fontSize: 40, fontWeight: 800, color: safeCount >= 3 ? "#25794F" : "#B97A12", marginTop: 6 }}>
                {safeCount}/{CALL_SCRIPT.length}
              </div>
              <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.5, maxWidth: 300, margin: "6px auto 0" }}>
                {safeCount === 4
                  ? "Impecable: colgó el fraude en cada oportunidad."
                  : safeCount >= 3
                  ? "Muy bien. Revise abajo la decisión que se puede mejorar."
                  : "El estafador habría avanzado. Revise cada decisión abajo."}
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              {history.map((h, i) => (
                <div key={i} style={{ borderLeft: `4px solid ${toneColor(h.tone)}`, background: h.tone === "safe" ? "#F1FAF1" : h.tone === "risky" ? "#FDF3F4" : "#FBF1DD", borderRadius: "0 8px 8px 0", padding: "9px 12px", marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: toneColor(h.tone) }}>Decisión {i + 1} — {toneLabel(h.tone)}</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 3, color: T.ink }}>{h.fb}</div>
                </div>
              ))}
            </div>
            <div style={{ background: T.brandSoft, borderRadius: 10, padding: "11px 13px", marginTop: 12, fontSize: 12.5, lineHeight: 1.55 }}>
              <b>Recuerde:</b> el identificador de llamadas se falsifica, la urgencia es el arma, y ningún banco pide usuarios, tokens ni códigos por teléfono. La salida siempre es la misma: colgar, avisar a su jefe y a TI, y llamar usted al número oficial.
            </div>
            <button className="sg-btn" onClick={reset} style={{ width: "100%", background: T.brand, color: "#fff", padding: "12px", fontSize: 14, marginTop: 12 }}>
              Repetir la llamada
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------- HUB DE SIMULACROS ---------------------- */

function SimulatorHub({ simState, setSimState, smsState, setSmsState }) {
  const [tab, setTab] = useState("correo");
  const tabs = [
    ["correo", "📧 Correo (Outlook)"],
    ["sms", "💬 SMS / WhatsApp"],
    ["llamada", "📞 Llamada"],
  ];
  return (
    <div>
      <h2 className="sg-display" style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>Simulacros</h2>
      <p style={{ color: T.inkSoft, fontSize: 14, margin: "0 0 14px" }}>
        Practique en los dos canales por donde llega el fraude: la bandeja del trabajo y el teléfono.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className="sg-btn"
            onClick={() => setTab(id)}
            style={{
              padding: "10px 18px", fontSize: 14, borderRadius: 999,
              background: tab === id ? T.brand : T.surface,
              color: tab === id ? "#fff" : T.brand,
              border: `2px solid ${T.brand}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "correo" && <Simulator simState={simState} setSimState={setSimState} />}
      {tab === "sms" && <SmsSim smsState={smsState} setSmsState={setSmsState} />}
      {tab === "llamada" && <CallSim />}
    </div>
  );
}

/* -------------------------- ANALIZADOR IA -------------------------- */

const EJEMPLO_ANALISIS = `De: Banco Seguro <alertas@banco-seguridad-gt.com>
Asunto: Verificación urgente de su cuenta

Estimado cliente, detectamos un acceso inusual. Verifique su identidad en las próximas 24 horas o su cuenta será bloqueada: http://bit.ly/verificar-cuenta`;

function Analyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "fallo");
      if (!data.veredicto || !Array.isArray(data.senales)) throw new Error("formato");
      setResult(data);
    } catch (e) {
      setError(
        e.message && e.message !== "formato" && e.message !== "fallo"
          ? e.message
          : "No se pudo completar el análisis. Verifique su conexión e intente de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const tone =
    result &&
    (result.veredicto === "phishing"
      ? { bg: T.dangerSoft, fg: T.danger, label: "🚩 PHISHING", badge: "danger" }
      : result.veredicto === "legitimo"
      ? { bg: T.okSoft, fg: T.ok, label: "✓ LEGÍTIMO", badge: "ok" }
      : { bg: T.warnSoft, fg: T.warn, label: "⚠ SOSPECHOSO", badge: "warn" });

  return (
    <div>
      <h2 className="sg-display" style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>Analizador con IA</h2>
      <p style={{ color: T.inkSoft, fontSize: 14, margin: "0 0 6px", lineHeight: 1.55 }}>
        ¿Recibió un mensaje que no aparece en la capacitación? Pegue aquí el texto (correo, SMS o WhatsApp) y reciba un
        veredicto explicado al instante.
      </p>
      <p style={{ color: T.inkSoft, fontSize: 12.5, margin: "0 0 16px" }}>
        Consejo: no pegue contraseñas ni números de tarjeta. El veredicto es una segunda opinión, no reemplaza el reporte a su equipo de TI.
      </p>

      <div className="sg-card" style={{ padding: 18 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Pegue aquí el mensaje completo, incluyendo remitente y asunto si los tiene…\n\nEjemplo:\n" + EJEMPLO_ANALISIS}
          rows={9}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${T.line}`,
            fontSize: 13.5, fontFamily: "'Inter',sans-serif", lineHeight: 1.55, resize: "vertical", color: T.ink,
          }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="sg-btn"
            disabled={loading || text.trim().length < 20}
            onClick={analyze}
            style={{
              background: loading || text.trim().length < 20 ? T.line : T.brand,
              color: "#fff", padding: "12px 24px", fontSize: 14,
              cursor: loading || text.trim().length < 20 ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Analizando…" : "🔎 Analizar mensaje"}
          </button>
          <button
            className="sg-btn"
            onClick={() => { setText(EJEMPLO_ANALISIS); setResult(null); setError(null); }}
            style={{ background: T.surface, color: T.brand, border: `2px solid ${T.brand}`, padding: "10px 18px", fontSize: 13 }}
          >
            Usar ejemplo
          </button>
          {text.trim().length > 0 && text.trim().length < 20 && (
            <span style={{ fontSize: 12.5, color: T.inkSoft }}>Pegue el mensaje completo para un mejor análisis.</span>
          )}
        </div>
      </div>

      {loading && (
        <div className="sg-card" style={{ marginTop: 14, padding: "16px 20px", fontSize: 14, color: T.inkSoft }}>
          Revisando remitente, urgencia, enlaces y patrones conocidos…
        </div>
      )}

      {error && (
        <div style={{ marginTop: 14, background: T.dangerSoft, borderRadius: 12, padding: "14px 18px", fontSize: 14, color: T.danger }}>
          {error}
        </div>
      )}

      {result && tone && (
        <div className="sg-card" style={{ marginTop: 14, overflow: "hidden", borderColor: tone.fg }}>
          <div style={{ background: tone.bg, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span className="sg-display" style={{ fontSize: 22, fontWeight: 800, color: tone.fg }}>{tone.label}</span>
            <Badge tone={tone.badge}>Confianza: {result.confianza}%</Badge>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div className="sg-display" style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".06em", color: T.inkSoft }}>
              SEÑALES DETECTADAS
            </div>
            {result.senales.map((s, i) => (
              <div key={i} style={{ fontSize: 14, lineHeight: 1.55, marginTop: 7, display: "flex", gap: 8 }}>
                <span style={{ color: tone.fg, fontWeight: 700 }}>▲</span>
                <span>{s}</span>
              </div>
            ))}
            <div style={{ background: T.brandSoft, borderLeft: `4px solid ${T.brand}`, borderRadius: "0 10px 10px 0", padding: "12px 14px", marginTop: 14 }}>
              <span className="sg-display" style={{ fontSize: 12, fontWeight: 800, color: T.brand, letterSpacing: ".06em" }}>QUÉ HACER — </span>
              <span style={{ fontSize: 13.5, lineHeight: 1.55 }}>{result.recomendacion}</span>
            </div>
            <p style={{ fontSize: 12, color: T.inkSoft, marginTop: 12, marginBottom: 0 }}>
              Análisis generado por IA con base en el texto proporcionado. Ante la duda, reporte al canal de su empresa sin hacer clic en nada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- RECURSOS --------------------------- */

const CHECKLIST = [
  "¿El dominio (después de la @) es exactamente el oficial?",
  "¿El mensaje crea urgencia, miedo o secretismo?",
  "¿Pide contraseñas, códigos, datos de tarjeta o una transferencia?",
  "¿El destino real del enlace coincide con el texto mostrado?",
  "¿El adjunto es .zip, .html o pide habilitar macros?",
  "¿Esperaba este mensaje de esta persona en este momento?",
];

function Resources() {
  const blocks = [
    {
      tag: "Checklist",
      title: "Verificación en 30 segundos",
      desc: "Para imprimir y pegar junto a cada monitor. Si alguna respuesta es sospechosa: no haga clic, reporte.",
      content: (
        <div style={{ marginTop: 10 }}>
          {CHECKLIST.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.55, marginTop: 7 }}>
              <span className="sg-mono" style={{ color: T.brand, fontWeight: 600 }}>[{i + 1}]</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      tag: "Plan",
      title: "Respuesta a incidentes en 5 pasos",
      desc: "Qué hacer en los primeros 30 minutos después de un clic.",
      content: (
        <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.7 }}>
          1. Desconectar el equipo de la red · 2. Cambiar contraseñas desde otro dispositivo · 3. Reportar a TI de inmediato · 4. Si hay dinero: llamar al banco y denunciar · 5. Guardar evidencia (correo, capturas, horas).
        </div>
      ),
    },
    {
      tag: "Plantilla",
      title: "Política de reporte para su pyme",
      desc: "Texto listo para adaptar y comunicar al equipo.",
      content: (
        <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.65, fontStyle: "italic", background: T.bg, borderRadius: 10, padding: "12px 14px" }}>
          «Todo colaborador que reciba un mensaje sospechoso debe reenviarlo a reportes@suempresa.com.gt sin abrir enlaces ni adjuntos. Ningún cambio de cuenta bancaria ni transferencia inusual se ejecuta sin confirmación telefónica al número previamente conocido. Reportar nunca tiene consecuencias negativas, aunque el mensaje resulte legítimo.»
        </div>
      ),
    },
    {
      tag: "Póster",
      title: "Regla de los 10 segundos",
      desc: "Mensaje único para la oficina.",
      content: (
        <div style={{ marginTop: 10, background: T.chipBg, borderRadius: 12, padding: "22px 18px", textAlign: "center" }}>
          <div className="sg-display" style={{ color: "#fff", fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>
            ¿Urgente, inesperado y pide algo?
          </div>
          <div className="sg-mono" style={{ color: T.chipTx, fontSize: 14, marginTop: 8 }}>
            DETÉNGASE 10 SEGUNDOS → VERIFIQUE → REPORTE
          </div>
        </div>
      ),
    },
  ];
  return (
    <div>
      <h2 className="sg-display" style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>Recursos descargables</h2>
      <p style={{ color: T.inkSoft, fontSize: 14, margin: "0 0 20px" }}>
        Material de refuerzo para imprimir o compartir. (En la versión final: botones de descarga en PDF).
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 14 }}>
        {blocks.map((b) => (
          <div key={b.title} className="sg-card" style={{ padding: "18px 20px" }}>
            <Badge>{b.tag}</Badge>
            <div className="sg-display" style={{ fontSize: 17, fontWeight: 800, marginTop: 10 }}>{b.title}</div>
            <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 4, lineHeight: 1.5 }}>{b.desc}</div>
            {b.content}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------- PANEL ADMIN -------------------------- */

function Admin() {
  const avg = Math.round(TEAM.reduce((a, p) => a + p.avance, 0) / TEAM.length);
  const certified = TEAM.filter((p) => p.exam !== null && p.exam >= 80).length;
  const risk = TEAM.filter((p) => p.sim < 70).length;
  return (
    <div>
      <h2 className="sg-display" style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>Panel del administrador</h2>
      <p style={{ color: T.inkSoft, fontSize: 14, margin: "0 0 18px" }}>
        Vista de la pyme: avance del equipo, aciertos en el simulador y certificaciones. (Datos de demostración).
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 18 }}>
        {[
          ["Avance promedio", `${avg}%`, T.brand],
          ["Certificados", `${certified} / ${TEAM.length}`, T.ok],
          ["Colaboradores en riesgo", `${risk}`, risk > 0 ? T.danger : T.ok],
        ].map(([l, v, c]) => (
          <div key={l} className="sg-card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 12, color: T.inkSoft }}>{l}</div>
            <div className="sg-display" style={{ fontSize: 28, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="sg-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 560 }}>
            <thead>
              <tr style={{ background: T.chipBg, color: "#fff", textAlign: "left" }}>
                {["Colaborador", "Área", "Avance de clases", "Simulador", "Evaluación"].map((h) => (
                  <th key={h} className="sg-display" style={{ padding: "12px 16px", fontSize: 12, letterSpacing: ".05em", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEAM.map((p, i) => (
                <tr key={p.name} style={{ borderTop: `1px solid ${T.line}`, background: i % 2 ? T.bg : "#fff" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: "12px 16px", color: T.inkSoft }}>{p.area}</td>
                  <td style={{ padding: "12px 16px", minWidth: 150 }}>
                    <Progress pct={p.avance} tone={p.avance === 100 ? T.ok : T.brand} />
                    <span style={{ fontSize: 11.5, color: T.inkSoft }}>{p.avance}%</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontWeight: 700, color: p.sim >= 80 ? T.ok : p.sim >= 70 ? T.warn : T.danger }}>{p.sim}%</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {p.exam === null
                      ? <Badge tone="warn">Pendiente</Badge>
                      : <Badge tone={p.exam >= 80 ? "ok" : "danger"}>{p.exam}% {p.exam >= 80 ? "· Certificado" : ""}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 10 }}>
        En la versión final: exportar a CSV, recordatorios automáticos y campañas de simulación programadas.
      </p>
    </div>
  );
}

/* ---------------------- PITCH / INVERSIONISTAS ---------------------- */

const fmtQ = (n) => "Q" + n.toLocaleString("es-GT");
const fmtQc = (n) => (n >= 1e6 ? `Q${(n / 1e6).toLocaleString("es-GT", { maximumFractionDigits: 2 })}M` : `Q${Math.round(n / 1e3)}k`);

const PITCH_CSS = `
.pv-lift { transition: transform .18s ease, box-shadow .18s ease; }
.pv-lift:hover { transform: translateY(-4px); box-shadow: 0 16px 34px rgba(12,31,34,.14); }
.pv-seg { border: 2px solid ${T.line}; background: ${T.surface}; color: ${T.inkSoft}; font-family: 'Archivo', sans-serif; font-weight: 700; font-size: 13px; padding: 9px 18px; border-radius: 999px; cursor: pointer; transition: background .15s ease, color .15s ease, border-color .15s ease; }
.pv-seg.on { background: ${T.brand}; border-color: ${T.brand}; color: #fff; }
.pv-seg:hover:not(.on) { border-color: ${T.brand}; color: ${T.brand}; }
@media (max-width: 720px) { .pv-tl-line { display: none; } }
`;

const PITCH_METRICS = [
  { to: 57600, prefix: "Q", label: "LTV", note: "Valor de vida del cliente" },
  { to: 72, suffix: "×", label: "LTV / CAC", note: "Rango excepcional para SaaS/MSSP" },
  { to: 80, suffix: "%", label: "Margen bruto", note: "Sobre servicios recurrentes" },
  { to: 9360, prefix: "Q", label: "MRR al mes 12", note: "Ingreso recurrente proyectado" },
  { to: 800, prefix: "Q", label: "CAC", note: "Costo de adquisición B2B" },
  { to: 1, suffix: "%", label: "Churn mensual", note: "Retención del 99%" },
  { to: 1712, prefix: "Q", label: "Burn rate", note: "Gasto neto de caja mensual" },
  { to: 157, label: "Meses de runway", note: "Con el capital actual" },
];

const PITCH_PNL = [
  { year: "2026", ingresos: 333810, gastos: 640362, ebitda: -306552 },
  { year: "2027", ingresos: 1450000, gastos: 980000, ebitda: 470000 },
  { year: "2028", ingresos: 2850000, gastos: 1450000, ebitda: 1400000 },
];

const PITCH_SCENARIOS = [
  { id: "optimista", name: "Optimista", growth: "8%", churn: "1%", ebitda: 1800000, note: "Adopción acelerada del canal MSSP y ciclos de venta más cortos." },
  { id: "base", name: "Base", growth: "6%", churn: "1%", ebitda: 1400000, note: "El plan presentado en este pitch: 30 clientes al mes 12, MRR duplicado al mes 18." },
  { id: "pesimista", name: "Pesimista", growth: "3%", churn: "3%", ebitda: 850000, note: "Aun con la mitad del crecimiento y el triple de churn, el negocio sigue siendo rentable al año 3." },
];

const PITCH_FUNDS = [
  { label: "Marketing y ventas", detail: "Adquisición de clientes MSSP", pct: 35, amount: 94500, color: "#0E5E63" },
  { label: "Tecnología", detail: "Infraestructura, licencias, herramientas", pct: 26, amount: 70000, color: "#37838A" },
  { label: "Operaciones", detail: "Soporte, automatización, administración", pct: 24, amount: 65000, color: "#699FA5" },
  { label: "Capital de trabajo", detail: "Reserva para gastos fijos", pct: 15, amount: 40500, color: "#A3C8CA" },
];

const PITCH_ROADMAP = [
  { when: "Hoy", what: "Plataforma en producción y 2 empresas piloto activas en servicios, comercio, educación privada y despachos profesionales." },
  { when: "Mes 12", what: "30 clientes MSSP: punto de equilibrio alcanzado. Flujo operativo positivo." },
  { when: "Mes 18", what: "MRR duplicado y equipo comercial consolidado." },
  { when: "Año 3", what: "Q2.85M de ingresos anuales y expansión regional en Centroamérica." },
];

function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function CountUp({ to, prefix = "", suffix = "", dur = 1400 }) {
  const [ref, inView] = useInView(0.5);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVal(to); return; }
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, dur]);
  return <span ref={ref}>{prefix}{val.toLocaleString("es-GT")}{suffix}</span>;
}

function Reveal({ children, delay = 0 }) {
  const [ref, inView] = useInView(0.12);
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(22px)", transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

const PitchSection = ({ kicker, title, intro, children, id }) => (
  <section id={id} style={{ marginTop: 52, scrollMarginTop: 80 }}>
    <Reveal>
      <Badge tone="brand">{kicker}</Badge>
      <h3 className="sg-display" style={{ fontSize: "clamp(21px, 3vw, 27px)", fontWeight: 800, margin: "12px 0 8px" }}>{title}</h3>
      {intro && <p style={{ color: T.inkSoft, fontSize: 14.5, lineHeight: 1.6, margin: "0 0 18px", maxWidth: 680 }}>{intro}</p>}
      {children}
    </Reveal>
  </section>
);

function BreakEvenTrack() {
  const [ref, inView] = useInView(0.4);
  return (
    <div ref={ref} style={{ padding: "44px 6px 40px" }}>
      <div style={{ position: "relative", height: 18, borderRadius: 999, background: `linear-gradient(90deg, ${T.line} 0 75%, ${T.okSoft} 75% 100%)` }}>
        <div style={{ position: "absolute", inset: 0, width: inView ? "75%" : "5%", transition: "width 1.4s cubic-bezier(.2,.7,.2,1)", borderRadius: 999, background: `linear-gradient(90deg, #699FA5, ${T.brand})` }} />
        {/* Hoy */}
        <div style={{ position: "absolute", left: "5%", top: "50%", transform: "translate(-50%,-50%)", width: 16, height: 16, borderRadius: "50%", background: T.chipBg, border: "3px solid #fff", boxShadow: "0 2px 6px rgba(12,31,34,.3)" }} />
        <div style={{ position: "absolute", left: "5%", top: 26, transform: "translateX(-30%)", fontSize: 12, color: T.inkSoft, whiteSpace: "nowrap" }}>
          <b style={{ color: T.ink }}>Hoy</b> · 2 pilotos
        </div>
        {/* Break-even */}
        <div style={{ position: "absolute", left: "75%", top: -8, bottom: -8, width: 3, background: T.ink, borderRadius: 2 }} />
        <div className="sg-display" style={{ position: "absolute", left: "75%", bottom: 30, transform: "translateX(-50%)", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", background: T.chipBg, color: T.chipTx, padding: "5px 12px", borderRadius: 999 }}>
          Break-even: 30 clientes · mes 12
        </div>
        <div style={{ position: "absolute", left: "77.5%", right: 0, top: 26, fontSize: 12, fontWeight: 700, color: T.ok, whiteSpace: "nowrap" }}>
          Zona de utilidad →
        </div>
      </div>
    </div>
  );
}

function RevenueChart() {
  const [ref, inView] = useInView(0.35);
  const max = Math.max(...PITCH_PNL.map((r) => r.ingresos));
  return (
    <div ref={ref} style={{ display: "flex", gap: 16, alignItems: "flex-end", padding: "6px 4px 0" }}>
      {PITCH_PNL.map((r, i) => {
        const h = Math.max(8, Math.round((r.ingresos / max) * 180));
        return (
          <div key={r.year} style={{ flex: 1, maxWidth: 170, textAlign: "center" }} title={`${r.year}: ingresos ${fmtQ(r.ingresos)}, gastos ${fmtQ(r.gastos)}`}>
            <div style={{ height: 210, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
              <div className="sg-display" style={{ fontWeight: 800, fontSize: "clamp(13px, 2vw, 17px)", color: T.brand, marginBottom: 6 }}>{fmtQc(r.ingresos)}</div>
              <div style={{ width: "68%", height: inView ? h : 0, transition: `height .9s cubic-bezier(.2,.7,.2,1) ${i * 140}ms`, background: "linear-gradient(180deg, #2E8F95, #0E5E63)", borderRadius: "8px 8px 0 0" }} />
            </div>
            <div style={{ borderTop: `2px solid ${T.ink}`, paddingTop: 8, marginTop: 0 }}>
              <div className="sg-display" style={{ fontWeight: 800, fontSize: 15 }}>{r.year}</div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2, color: r.ebitda >= 0 ? T.ok : T.danger }}>
                EBITDA {r.ebitda >= 0 ? "+" : "−"}{fmtQc(Math.abs(r.ebitda))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScenarioExplorer() {
  const [sc, setSc] = useState("base");
  const cur = PITCH_SCENARIOS.find((s) => s.id === sc);
  const maxE = Math.max(...PITCH_SCENARIOS.map((s) => s.ebitda));
  return (
    <div className="sg-card" style={{ padding: 22, marginTop: 14 }}>
      <div className="sg-display" style={{ fontWeight: 800, fontSize: 16 }}>Pruebe usted mismo los tres escenarios</div>
      <p style={{ fontSize: 13, color: T.inkSoft, margin: "4px 0 14px" }}>En los tres, el negocio es rentable al año 3. Elija uno:</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PITCH_SCENARIOS.map((s) => (
          <button key={s.id} className={`pv-seg${sc === s.id ? " on" : ""}`} onClick={() => setSc(s.id)}>
            {s.name}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 26, flexWrap: "wrap", marginTop: 18 }}>
        {[
          [cur.growth, "crecimiento mensual"],
          [cur.churn, "churn mensual"],
        ].map(([v, l]) => (
          <div key={l}>
            <div className="sg-display" style={{ fontSize: 24, fontWeight: 800 }}>{v}</div>
            <div style={{ fontSize: 12, color: T.inkSoft }}>{l}</div>
          </div>
        ))}
        <div style={{ flex: "1 1 240px", minWidth: 220 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 12, color: T.inkSoft }}>EBITDA año 3</span>
            <span className="sg-display" style={{ fontSize: 24, fontWeight: 800, color: T.ok }}>{fmtQ(cur.ebitda)}</span>
          </div>
          <div style={{ background: T.line, borderRadius: 999, height: 14, overflow: "hidden", marginTop: 6 }}>
            <div style={{ width: `${Math.round((cur.ebitda / maxE) * 100)}%`, background: T.ok, height: "100%", borderRadius: 999, transition: "width .5s cubic-bezier(.2,.7,.2,1)" }} />
          </div>
        </div>
      </div>
      <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: "14px 0 0", background: T.bg, borderRadius: 10, padding: "10px 14px" }}>{cur.note}</p>
    </div>
  );
}

function FundsDonut() {
  const size = 200, stroke = 32;
  const R = (size - stroke) / 2;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribución del uso de fondos: marketing 35%, tecnología 26%, operaciones 24%, capital de trabajo 15%">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {PITCH_FUNDS.map((f) => {
          const frac = f.pct / 100;
          const dash = Math.max(0, frac * C - 3);
          const off = -(acc * C);
          acc += frac;
          return (
            <circle key={f.label} cx={size / 2} cy={size / 2} r={R} fill="none" stroke={f.color} strokeWidth={stroke} strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={off}>
              <title>{`${f.label}: ${f.pct}% · ${fmtQ(f.amount)}`}</title>
            </circle>
          );
        })}
      </g>
      <text x="50%" y="47%" textAnchor="middle" style={{ font: "800 21px Archivo, system-ui, sans-serif", fill: T.ink }}>Q270,000</text>
      <text x="50%" y="58%" textAnchor="middle" style={{ font: "500 11px Inter, system-ui, sans-serif", fill: T.inkSoft }}>capital semilla</text>
    </svg>
  );
}

function Pitch() {
  const th = { textAlign: "left", padding: "10px 14px", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: T.inkSoft, borderBottom: `2px solid ${T.line}`, whiteSpace: "nowrap" };
  const td = { padding: "11px 14px", fontSize: 14, borderBottom: `1px solid ${T.line}`, whiteSpace: "nowrap" };
  const mail = "mailto:contacto@cibercultura.gt?subject=Interés%20en%20invertir%20en%20CiberCultura";
  const goMetrics = () => document.getElementById("pv-metricas")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div>
      <style>{PITCH_CSS}</style>

      {/* Hero */}
      <Reveal>
        <div
          style={{
            borderRadius: 20, padding: "clamp(28px, 5vw, 52px)", color: "#fff", overflow: "hidden", position: "relative",
            background: `radial-gradient(900px 420px at 88% -20%, rgba(37,121,79,.45), transparent 62%), radial-gradient(700px 380px at -12% 115%, rgba(14,94,99,.65), transparent 60%), ${T.chipBg}`,
          }}
        >
          <span className="sg-display" style={{ display: "inline-block", background: "rgba(191,227,214,.14)", color: T.chipTx, fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(191,227,214,.35)" }}>
            Oportunidad de inversión · Capital semilla
          </span>
          <h2 className="sg-display" style={{ fontSize: "clamp(30px, 5.5vw, 52px)", lineHeight: 1.07, margin: "18px 0 14px", fontWeight: 800, maxWidth: 760 }}>
            Las pymes ya son el blanco.
            <br />
            <span style={{ color: T.chipTx }}>CiberCultura las convierte en el firewall.</span>
          </h2>
          <p style={{ color: "#D7E4E0", fontSize: "clamp(14px, 1.8vw, 16.5px)", lineHeight: 1.65, maxWidth: 640, margin: 0 }}>
            Ciberseguridad gestionada por suscripción (MSSP) más consultoría especializada, diseñada y cotizada
            para las pymes de Guatemala. La plataforma que usted está usando en este momento
            <b style={{ color: "#fff" }}> es el producto, ya en producción.</b>
          </p>
          <div style={{ display: "flex", gap: "clamp(20px, 4vw, 44px)", marginTop: 28, flexWrap: "wrap" }}>
            {[
              { to: 270000, prefix: "Q", label: "capital solicitado" },
              { to: 12, label: "meses al break-even" },
              { to: 3, suffix: "×", label: "ingresos en 36 meses" },
            ].map((s) => (
              <div key={s.label}>
                <div className="sg-display" style={{ fontSize: "clamp(26px, 3.4vw, 36px)", fontWeight: 800, color: "#fff" }}>
                  <CountUp to={s.to} prefix={s.prefix || ""} suffix={s.suffix || ""} />
                </div>
                <div style={{ fontSize: 12.5, color: "#9DB8B2" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
            <a href={mail} className="sg-btn" style={{ display: "inline-block", background: T.chipTx, color: T.chipBg, padding: "13px 26px", fontSize: 15, textDecoration: "none" }}>
              Quiero invertir
            </a>
            <button className="sg-btn" onClick={goMetrics} style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,.4)", padding: "11px 24px", fontSize: 15 }}>
              Ver los números ↓
            </button>
          </div>
        </div>
      </Reveal>

      {/* Oportunidad */}
      <PitchSection kicker="La oportunidad" title="Un mercado enorme, desprotegido y sin oferta a su medida">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
          {[
            { icon: "📧", stat: "90%", text: "de los incidentes de seguridad en empresas pequeñas comienza con un simple correo de phishing." },
            { icon: "💸", stat: "Q48,500", text: "puede costar una sola transferencia desviada por fraude BEC — más de dos años de nuestra suscripción completa." },
            { icon: "🛡️", stat: "80%", text: "de la protección se logra con hábitos y procesos simples. Nadie se los está enseñando a las pymes. Ese es nuestro mercado." },
          ].map((c, i) => (
            <div key={c.stat} className="sg-card pv-lift" style={{ padding: "22px 20px", borderTop: `4px solid ${i === 1 ? T.danger : T.brand}` }}>
              <div style={{ fontSize: 26 }}>{c.icon}</div>
              <div className="sg-display" style={{ fontSize: 34, fontWeight: 800, color: i === 1 ? T.danger : T.brand, margin: "6px 0 4px" }}>{c.stat}</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: T.inkSoft, margin: 0 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </PitchSection>

      {/* Modelo de negocio */}
      <PitchSection kicker="Modelo de negocio" title="Dos motores de ingreso que se alimentan entre sí">
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div className="sg-card pv-lift" style={{ flex: "1 1 300px", padding: 22, borderTop: `4px solid ${T.brand}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div className="sg-display" style={{ fontSize: 17, fontWeight: 800 }}>Suscripción MSSP</div>
              <Badge tone="brand">65% del mix</Badge>
            </div>
            <div className="sg-display" style={{ fontSize: 34, fontWeight: 800, color: T.brand, marginTop: 10 }}>
              Q1,800<span style={{ fontSize: 14, color: T.inkSoft, fontWeight: 600 }}> /cliente·mes</span>
            </div>
            <p style={{ fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6, margin: "8px 0 0" }}>
              Ingreso recurrente y predecible: simulaciones de phishing, microcapacitaciones, monitoreo, alertas,
              hardening, seguimiento y reportes de resultados.
            </p>
          </div>
          <div className="sg-card pv-lift" style={{ flex: "1 1 300px", padding: 22, borderTop: `4px solid ${T.warn}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div className="sg-display" style={{ fontSize: 17, fontWeight: 800 }}>Proyectos de consultoría</div>
              <Badge tone="warn">35% del mix</Badge>
            </div>
            <div className="sg-display" style={{ fontSize: 34, fontWeight: 800, color: T.warn, marginTop: 10 }}>
              Q15,000<span style={{ fontSize: 14, color: T.inkSoft, fontWeight: 600 }}> /proyecto</span>
            </div>
            <p style={{ fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6, margin: "8px 0 0" }}>
              Tickets altos: auditorías, pentesting, campañas especiales de concientización y acompañamiento en
              cumplimiento ISO/NIST.
            </p>
          </div>
        </div>
        <div style={{ background: T.brandSoft, borderRadius: 12, padding: "13px 18px", marginTop: 14, fontSize: 13.5, lineHeight: 1.55, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>🔁</span>
          <span><b>El círculo virtuoso:</b> cada proyecto de consultoría abre la puerta a una suscripción; cada suscriptor genera nuevos proyectos. Un solo cliente, dos fuentes de ingreso.</span>
        </div>
      </PitchSection>

      {/* Métricas */}
      <PitchSection
        id="pv-metricas"
        kicker="Tracción y unidad económica"
        title="Los números que un inversionista quiere ver"
        intro="Propuesta validada con 2 empresas piloto guatemaltecas en los sectores de servicios, comercio, educación privada y despachos profesionales."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 12 }}>
          {PITCH_METRICS.map((m) => (
            <div key={m.label} className="sg-card pv-lift" style={{ padding: "16px 18px" }}>
              <div className="sg-display" style={{ fontSize: 27, fontWeight: 800, color: T.brand, lineHeight: 1.1 }}>
                <CountUp to={m.to} prefix={m.prefix || ""} suffix={m.suffix || ""} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 5 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 2, lineHeight: 1.45 }}>{m.note}</div>
            </div>
          ))}
        </div>
      </PitchSection>

      {/* Break-even */}
      <PitchSection kicker="Camino a la utilidad" title="Break-even con solo 30 clientes">
        <div className="sg-card" style={{ padding: "8px 22px 4px" }}>
          <BreakEvenTrack />
          <p style={{ fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6, margin: "0 0 18px" }}>
            Con 30 clientes MSSP la empresa cubre todos sus costos fijos y variables.{" "}
            <b style={{ color: T.ink }}>A partir del cliente 31, cada quetzal de ingreso recurrente se convierte en utilidad neta</b> —
            con un margen bruto del 80% y un churn de apenas 1%.
          </p>
        </div>
      </PitchSection>

      {/* Proyecciones */}
      <PitchSection kicker="Proyecciones · 36 meses" title="De la inversión a triplicar ingresos">
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "stretch" }}>
          <div className="sg-card" style={{ flex: "1 1 340px", padding: 22 }}>
            <div className="sg-display" style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Ingresos anuales — escenario base</div>
            <RevenueChart />
            <p style={{ fontSize: 12.5, color: T.inkSoft, lineHeight: 1.55, margin: "14px 0 0" }}>
              Rentabilidad sostenida desde el mes 12. Flujo acumulado al mes 12: −Q530,272, financiable sin deuda
              durante 12 a 18 meses.
            </p>
          </div>
          <div className="sg-card" style={{ flex: "1 1 340px", padding: 22 }}>
            <div className="sg-display" style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Estado de resultados proyectado</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 380 }}>
                <thead>
                  <tr>
                    <th style={th}>Año</th><th style={th}>Ingresos</th><th style={th}>Gastos</th><th style={th}>EBITDA</th>
                  </tr>
                </thead>
                <tbody>
                  {PITCH_PNL.map((r) => (
                    <tr key={r.year}>
                      <td style={{ ...td, fontWeight: 700 }}>{r.year}</td>
                      <td style={td}>{fmtQ(r.ingresos)}</td>
                      <td style={td}>{fmtQ(r.gastos)}</td>
                      <td style={{ ...td, color: r.ebitda >= 0 ? T.ok : T.danger, fontWeight: 700 }}>
                        {r.ebitda >= 0 ? "+" : "−"}{fmtQ(Math.abs(r.ebitda))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12.5, color: T.inkSoft, lineHeight: 1.55, margin: "14px 0 0" }}>
              La inversión de un año negativo (2026) compra una máquina que genera Q1.4M de EBITDA al tercer año.
            </p>
          </div>
        </div>
        <ScenarioExplorer />
      </PitchSection>

      {/* Uso de fondos */}
      <PitchSection kicker="La inversión" title="Cada quetzal de los Q270,000, con nombre y apellido">
        <div className="sg-card" style={{ padding: 22 }}>
          <div style={{ display: "flex", gap: 26, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: "0 0 auto", margin: "0 auto" }}>
              <FundsDonut />
            </div>
            <div style={{ flex: "1 1 300px", minWidth: 260 }}>
              {PITCH_FUNDS.map((f) => (
                <div key={f.label} style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.line}` }}>
                  <span style={{ width: 13, height: 13, borderRadius: 4, background: f.color, flexShrink: 0, alignSelf: "center" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: T.inkSoft }}>{f.detail}</div>
                  </div>
                  <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div className="sg-display" style={{ fontWeight: 800, fontSize: 16 }}>{f.pct}%</div>
                    <div style={{ fontSize: 12, color: T.inkSoft }}>{fmtQ(f.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: T.warnSoft, borderLeft: `4px solid ${T.warn}`, borderRadius: "0 10px 10px 0", padding: "12px 16px", marginTop: 18, fontSize: 13.5, lineHeight: 1.55 }}>
            <b>Objetivo del capital:</b> alcanzar 30 clientes MSSP (break-even) en 12 meses y duplicar el MRR en 18 meses.
          </div>
        </div>
      </PitchSection>

      {/* Roadmap */}
      <PitchSection kicker="Hoja de ruta" title="De 2 pilotos a la expansión regional">
        <div style={{ position: "relative" }}>
          <div className="pv-tl-line" style={{ position: "absolute", top: 9, left: 10, right: 10, height: 2, background: T.line }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
            {PITCH_ROADMAP.map((r, i) => (
              <Reveal key={r.when} delay={i * 120}>
                <div>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: i === 0 ? T.brand : T.surface, border: `4px solid ${T.brand}`, position: "relative", zIndex: 1 }} />
                  <div className="sg-display" style={{ fontWeight: 800, fontSize: 17, margin: "10px 0 4px", color: T.brand }}>{r.when}</div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.inkSoft, margin: 0 }}>{r.what}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PitchSection>

      {/* Cierre */}
      <section style={{ marginTop: 52 }}>
        <Reveal>
          <div style={{ borderRadius: 20, padding: "clamp(30px, 5vw, 48px)", textAlign: "center", background: `linear-gradient(135deg, ${T.brand}, ${T.chipBg} 75%)` }}>
            <h3 className="sg-display" style={{ color: "#fff", fontSize: "clamp(22px, 3.6vw, 34px)", fontWeight: 800, margin: 0, lineHeight: 1.2, maxWidth: 700, marginInline: "auto" }}>
              No le pedimos que imagine el producto. Acaba de usarlo.
            </h3>
            <p style={{ color: "#D7E4E0", fontSize: 14.5, lineHeight: 1.65, maxWidth: 620, margin: "14px auto 0" }}>
              Break-even rápido, burn rate bajo, LTV/CAC de 72× y rentabilidad incluso en el escenario pesimista.
              CiberCultura es un modelo sólido, escalable y listo para crecer con el socio correcto.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 22 }}>
              <a href={mail} className="sg-btn" style={{ display: "inline-block", background: "#fff", color: T.brand, padding: "13px 28px", fontSize: 15, textDecoration: "none" }}>
                Agendar una reunión
              </a>
              <a
                href="mailto:contacto@cibercultura.gt?subject=Solicitud%20del%20pitch%20financiero%20completo"
                className="sg-btn"
                style={{ display: "inline-block", background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,.45)", padding: "11px 26px", fontSize: 15, textDecoration: "none" }}
              >
                Solicitar el pitch completo
              </a>
            </div>
          </div>
        </Reveal>
        <p style={{ fontSize: 12, color: T.inkSoft, textAlign: "center", marginTop: 12 }}>
          Cifras del pitch financiero de CiberCultura (escenario base, proyección a 36 meses). Documento completo disponible bajo solicitud.
        </p>
      </section>
    </div>
  );
}

/* ============================== APP ============================== */

const NAV = [
  { id: "inicio", label: "Inicio" },
  { id: "clases", label: "Clases" },
  { id: "simulador", label: "Simulacros" },
  { id: "analizador", label: "Analizador IA" },
  { id: "evaluacion", label: "Evaluación" },
  { id: "recursos", label: "Recursos" },
  { id: "admin", label: "Panel admin" },
  { id: "pitch", label: "Inversionistas" },
];

export default function App() {
  const [view, setView] = useState(() => {
    const h = window.location.hash.replace("#", "");
    return NAV.some((n) => n.id === h) ? h : "inicio";
  });
  useEffect(() => {
    window.history.replaceState(null, "", view === "inicio" ? window.location.pathname : `#${view}`);
    window.scrollTo(0, 0);
  }, [view]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState({ lessons: new Set(), quizzes: new Set() });
  const [simState, setSimState] = useState({});
  const [smsState, setSmsState] = useState({});
  const [examResult, setExamResult] = useState(null);

  const totalLessons = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const stats = {
    done: progress.lessons.size,
    total: totalLessons,
    pct: Math.round((progress.lessons.size / totalLessons) * 100),
  };

  return (
    <div className="sg-root">
      <style>{GLOBAL_CSS}</style>
      <header style={{ background: T.surface, borderBottom: `1px solid ${T.line}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div className="sg-display" style={{ fontWeight: 800, fontSize: 17, padding: "14px 0", marginRight: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: T.brand, color: "#fff", borderRadius: 8, padding: "3px 8px", fontSize: 14 }}>◉</span>
            SEGURO<span style={{ color: T.brand }}>·GT</span>
          </div>
          <nav className="sg-desktopnav" style={{ display: "flex", gap: 2, overflowX: "auto", flex: 1 }}>
            {NAV.map((n) => (
              <button
                key={n.id}
                className="sg-nav"
                onClick={() => setView(n.id)}
                style={{
                  padding: "16px 12px", fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap",
                  color: view === n.id ? T.brand : T.inkSoft,
                  borderBottom: `3px solid ${view === n.id ? T.brand : "transparent"}`,
                }}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <button
            className="sg-burger"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span style={{ transform: menuOpen ? "translateY(7.5px) rotate(45deg)" : "none" }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? "translateY(-7.5px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
        {menuOpen && (
          <nav className="sg-mobilemenu" style={{ borderTop: `1px solid ${T.line}`, background: T.surface, boxShadow: "0 18px 28px rgba(12,31,34,.14)", animation: "sgMenuIn .22s ease-out" }}>
            {NAV.map((n, i) => (
              <button
                key={n.id}
                className="sg-nav"
                onClick={() => { setView(n.id); setMenuOpen(false); }}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "14px 22px", fontSize: 15, fontWeight: 700,
                  color: view === n.id ? T.brand : T.ink,
                  background: view === n.id ? T.brandSoft : "transparent",
                  borderLeft: `4px solid ${view === n.id ? T.brand : "transparent"}`,
                  animation: `sgItemIn .3s ease-out ${i * 35}ms backwards`,
                }}
              >
                {n.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "30px 20px 60px" }}>
        {view === "inicio" && <Home go={setView} stats={stats} />}
        {view === "clases" && <Classes progress={progress} setProgress={setProgress} />}
        {view === "simulador" && <SimulatorHub simState={simState} setSimState={setSimState} smsState={smsState} setSmsState={setSmsState} />}
        {view === "analizador" && <Analyzer />}
        {view === "evaluacion" && <Exam examResult={examResult} setExamResult={setExamResult} />}
        {view === "recursos" && <Resources />}
        {view === "admin" && <Admin />}
        {view === "pitch" && <Pitch />}
      </main>

      <footer style={{ borderTop: `1px solid ${T.line}`, padding: "18px 20px", textAlign: "center", fontSize: 12, color: T.inkSoft }}>
        SEGURO·GT — Prototipo de capacitación anti-phishing para pymes · Los dominios y marcas de los ejemplos son ficticios con fines educativos.
      </footer>
    </div>
  );
}
