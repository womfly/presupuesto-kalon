// ============================================================
//  TABLA DE PRECIOS — KALON
//
//  ¡IMPORTANTE! La duración tiene precios DIFERENTES según el servicio:
//  - Glitter Bar y Maquillaje Neón → precio FIJO por tramo de duración
//  - Maquillaje Novia               → 30 € por hora (precio variable)
//
//  Por eso en vez de un solo objeto "duracion", tenemos dos:
//  PRECIOS.duracion.glitter_neon y PRECIOS.duracion.novia
// ============================================================

const PRECIOS = {

  // Los tres tipos de sesión NO tienen precio base propio;
  // el precio lo marca directamente la duración (ver más abajo).
  // Guardamos solo sus etiquetas en NOMBRES (más abajo).

  // — Precios de duración para Glitter Bar y Maquillaje Neón —
  // Son precios fijos: si contratas 3h pagas 200€, aunque uses 2h 45min.
  duracion: {
    glitter_neon: {
      "2h":             160,
      "3h":             200,
      "4h":             220,
      "media_jornada":  300,
      "jornada_completa": 400,
    },
    // — Precios de duración para Maquillaje Novia —
    // Son 30€ por hora. Definimos "media jornada" como 6h y "jornada completa" como 8h.
    novia: {
      "2h":              60,   // 2h × 30€
      "3h":              90,   // 3h × 30€
      "4h":             120,   // 4h × 30€
      "media_jornada":  180,   // 6h × 30€
      "jornada_completa": 240, // 8h × 30€
    },
  },

  // — Desplazamiento (igual que Olivaloló) —
  desplazamiento: {
    sin:        0,
    local:      25,
    provincial: 60,
    nacional:   150,
  },

  // — Extras —
  // Los extras "por_hora" y "por_persona" se multiplican por la cantidad
  // que el usuario introduzca en el input numérico.
  // Los extras "fijo" se suman directamente.
  extras: {
    prueba_maquillaje: { precio: 30,  tipo: "fijo"       },
    acompanamiento:    { precio: 30,  tipo: "por_hora"   },
    peinado_basico:    { precio: 15,  tipo: "fijo"       },
    peinado_elaborado: { precio: 25,  tipo: "fijo"       },
    persona_extra:     { precio: 30,  tipo: "por_persona"},
  },
};

// ============================================================
//  OPCIONES DEL SELECT DE DURACIÓN
//
//  Estas son las opciones que aparecen en el desplegable de duración.
//  Guardamos también las etiquetas aquí para actualizar el select con JS.
//  El precio de cada opción cambia según el servicio seleccionado.
// ============================================================

const OPCIONES_DURACION = [
  { value: "2h",              label: "2 horas"         },
  { value: "3h",              label: "3 horas"         },
  { value: "4h",              label: "4 horas"         },
  { value: "media_jornada",   label: "Media jornada"   },
  { value: "jornada_completa",label: "Jornada completa"},
];

// ============================================================
//  NOMBRES LEGIBLES
//  Traduce los valores internos a texto que verá el usuario.
// ============================================================

const NOMBRES = {
  tipoSesion: {
    glitter_bar:      "Servicio Glitter Bar",
    maquillaje_neon:  "Maquillaje Neón",
    maquillaje_novia: "Servicio Maquillaje Novia",
  },
  duracion: {
    "2h":              "2 horas",
    "3h":              "3 horas",
    "4h":              "4 horas",
    "media_jornada":   "Media jornada",
    "jornada_completa":"Jornada completa",
  },
  desplazamiento: {
    sin:        "Sin desplazamiento",
    local:      "Local (≤20 km)",
    provincial: "Provincial",
    nacional:   "Nacional",
  },
  extras: {
    prueba_maquillaje: "Prueba de maquillaje",
    acompanamiento:    "Servicio de Acompañamiento",
    peinado_basico:    "Peinado básico",
    peinado_elaborado: "Peinado elaborado",
    persona_extra:     "Persona extra (a maquillar)",
  },
};

// ============================================================
//  COLORES DE MARCA en formato RGB para jsPDF
//  (los mismos que en el CSS de Olivaloló/KALON)
// ============================================================

const COLOR = {
  primary:  [53,  69,  76],   // #35454c — verde oscuro
  accent:   [47,  158, 167],  // #2f9ea7 — azul petróleo
  accent2:  [92,  132, 145],  // #5c8491 — azul medio
  warm:     [212, 175, 55],   // #d4af37 — dorado
  bgCream:  [244, 239, 232],  // #f4efe8 — crema
  white:    [255, 255, 255],
  black:    [0,   0,   0],
  muted:    [95,  111, 117],  // #5f6f75 — gris azulado
};

// ============================================================
//  REFERENCIAS AL DOM
// ============================================================

const form             = document.getElementById("budgetForm");
const totalAmountEl    = document.getElementById("totalAmount");
const summaryBodyEl    = document.getElementById("summaryBody");
const progressBarEl    = document.getElementById("progressBar");
const btnGenerar       = document.getElementById("btnGenerar");
const btnReset         = document.getElementById("btnReset");
const toastEl          = document.getElementById("toast");
const selectDuracion   = document.getElementById("duracion");

// Referencias a los bloques de cantidad de los extras variables
const chkAcompanamiento  = document.getElementById("chkAcompanamiento");
const wrapAcompanamiento = document.getElementById("wrapAcompanamiento");
const chkPersonaExtra    = document.getElementById("chkPersonaExtra");
const wrapPersonaExtra   = document.getElementById("wrapPersonaExtra");

// Referencias a los banners informativos
const infoBannerNovia   = document.getElementById("infoBannerNovia");
const infoBannerGlitter = document.getElementById("infoBannerGlitter");

// ============================================================
//  ACTUALIZAR SELECT DE DURACIÓN
//
//  Cuando el usuario elige un tipo de sesión, esta función
//  regenera las opciones del select con los precios correctos.
//
//  tipoServicio: "glitter_neon" o "novia"
// ============================================================

function actualizarSelectDuracion(tipoServicio) {
  // Vaciamos el select antes de rellenarlo de nuevo
  selectDuracion.innerHTML = "";

  if (!tipoServicio) {
    // Si no hay servicio seleccionado, mostramos la opción vacía por defecto
    const opcionVacia = document.createElement("option");
    opcionVacia.value = "";
    opcionVacia.textContent = "— Primero selecciona el tipo de sesión —";
    selectDuracion.appendChild(opcionVacia);
    return;
  }

  // Opción vacía encabezado
  const opcionVacia = document.createElement("option");
  opcionVacia.value = "";
  opcionVacia.textContent = "— Selecciona una duración —";
  selectDuracion.appendChild(opcionVacia);

  // Creamos una <option> por cada duración disponible
  OPCIONES_DURACION.forEach(opcion => {
    const precio = PRECIOS.duracion[tipoServicio][opcion.value];
    // Construimos el texto que se mostrará: "2 horas — 160 €"
    const textoOpcion = `${opcion.label} — ${precio} €`;

    const el = document.createElement("option");
    // document.createElement("option") crea un elemento <option> nuevo en memoria
    el.value = opcion.value;
    el.textContent = textoOpcion;
    // dataset.precio guarda el precio en el atributo data-precio del elemento
    el.dataset.precio = precio;

    selectDuracion.appendChild(el);
    // .appendChild() añade el elemento como hijo del select
  });
}

// ============================================================
//  MOSTRAR/OCULTAR BANNERS INFORMATIVOS
// ============================================================

function actualizarBanners(tipoSesion) {
  // Primero ocultamos los dos
  infoBannerNovia.classList.remove("visible");
  infoBannerGlitter.classList.remove("visible");

  // Luego mostramos el que corresponde
  if (tipoSesion === "maquillaje_novia") {
    infoBannerNovia.classList.add("visible");
  } else if (tipoSesion === "glitter_bar" || tipoSesion === "maquillaje_neon") {
    infoBannerGlitter.classList.add("visible");
  }
}

// ============================================================
//  MOSTRAR/OCULTAR BLOQUES DE CANTIDAD EN EXTRAS
//
//  Si el usuario marca el checkbox de Acompañamiento o Persona Extra,
//  aparece un input para introducir cuántas horas/personas quiere.
// ============================================================

function actualizarCantidades() {
  // .checked devuelve true si el checkbox está marcado, false si no
  if (chkAcompanamiento.checked) {
    wrapAcompanamiento.classList.add("visible");
  } else {
    wrapAcompanamiento.classList.remove("visible");
  }

  if (chkPersonaExtra.checked) {
    wrapPersonaExtra.classList.add("visible");
  } else {
    wrapPersonaExtra.classList.remove("visible");
  }
}

// ============================================================
//  FUNCIÓN PRINCIPAL: leer formulario y recalcular todo
// ============================================================

function calcular() {
  const datos    = leerFormulario();
  const desglose = construirDesglose(datos);
  renderizarResumen(desglose);
  actualizarProgreso(datos);
  actualizarBoton(datos);
}

// ============================================================
//  LEER FORMULARIO
// ============================================================

function leerFormulario() {
  // — Tipo de sesión —
  const tipoSesionEl = form.querySelector('input[name="tipoSesion"]:checked');
  const tipoSesion   = tipoSesionEl ? tipoSesionEl.value : null;

  // — Duración —
  const duracion = selectDuracion.value;

  // — Desplazamiento —
  const desplazamientoEl = form.querySelector('input[name="desplazamiento"]:checked');
  const desplazamiento   = desplazamientoEl ? desplazamientoEl.value : "sin";

  // — Extras con sus cantidades —
  // Para cada extra marcado, guardamos también la cantidad si la tiene
  const extrasSeleccionados = [];

  form.querySelectorAll('input[name="extras"]:checked').forEach(el => {
    const valor = el.value;
    const tipo  = el.dataset.tipo;   // "fijo", "por_hora" o "por_persona"
    let cantidad = 1;                 // cantidad por defecto

    // Si el extra es por horas, leemos el input de horas
    if (tipo === "por_hora") {
      cantidad = parseInt(document.getElementById("horasAcompanamiento").value) || 1;
      // parseInt() convierte el texto del input a un número entero
      // || 1 asegura que si el campo está vacío o es 0, usamos 1 como mínimo
    }

    // Si el extra es por personas, leemos el input de personas
    if (tipo === "por_persona") {
      cantidad = parseInt(document.getElementById("personasExtra").value) || 1;
    }

    extrasSeleccionados.push({ valor, tipo, cantidad });
  });

  // — Datos del cliente —
  const clienteNombre   = form.querySelector('#clienteNombre').value.trim();
  const clienteEmail    = form.querySelector('#clienteEmail').value.trim();
  const clienteTelefono = form.querySelector('#clienteTelefono').value.trim();
  const fechaEvento     = form.querySelector('#fechaEvento').value;

  return { tipoSesion, duracion, desplazamiento, extrasSeleccionados, clienteNombre, clienteEmail, clienteTelefono, fechaEvento };
}

// ============================================================
//  CONSTRUIR DESGLOSE
//
//  La lógica es diferente a Olivaloló porque:
//  1. No hay precio base del tipo de sesión (el precio lo da la duración)
//  2. Los extras pueden multiplicarse por una cantidad
// ============================================================

function construirDesglose(datos) {
  const lineas = [];
  let total = 0;

  // — Tipo de sesión (informativo, sin precio propio) —
  if (datos.tipoSesion) {
    lineas.push({
      categoria: "Tipo de sesión",
      nombre:    NOMBRES.tipoSesion[datos.tipoSesion],
      precio:    0, // El precio lo aporta la duración
    });
  }

  // — Duración —
  if (datos.tipoSesion && datos.duracion && datos.duracion !== "") {
    // Determinamos qué tabla de precios usar según el tipo de sesión
    // "glitter_bar" y "maquillaje_neon" comparten la misma tabla
    const tablaDuracion = datos.tipoSesion === "maquillaje_novia"
      ? "novia"
      : "glitter_neon";
    // El operador ternario: condición ? "valor si true" : "valor si false"

    const precio = PRECIOS.duracion[tablaDuracion][datos.duracion] || 0;

    // Construimos la etiqueta: añadimos "× 30€/h" si es novia, para que quede claro
    let nombreDuracion = NOMBRES.duracion[datos.duracion];
    if (tablaDuracion === "novia") {
      nombreDuracion += " (30 €/h)";
    }

    lineas.push({ categoria: "Duración", nombre: nombreDuracion, precio });
    total += precio;
  }

  // — Desplazamiento —
  if (datos.desplazamiento) {
    const precio = PRECIOS.desplazamiento[datos.desplazamiento] || 0;
    lineas.push({
      categoria: "Desplazamiento",
      nombre:    NOMBRES.desplazamiento[datos.desplazamiento],
      precio,
    });
    total += precio;
  }

  // — Extras —
  datos.extrasSeleccionados.forEach(extra => {
    const config = PRECIOS.extras[extra.valor];
    // El precio total del extra = precio unitario × cantidad
    const precioTotal = config.precio * extra.cantidad;

    // Construimos la etiqueta según el tipo de extra
    let nombre = NOMBRES.extras[extra.valor];
    if (extra.tipo === "por_hora") {
      nombre += ` (${extra.cantidad}h × ${config.precio} €)`;
    }
    if (extra.tipo === "por_persona") {
      nombre += ` (${extra.cantidad} × ${config.precio} €)`;
    }

    lineas.push({ categoria: "Extra", nombre, precio: precioTotal });
    total += precioTotal;
  });

  return { lineas, total };
}

// ============================================================
//  RENDERIZAR RESUMEN en el panel lateral
// ============================================================

function renderizarResumen(desglose) {
  if (desglose.lineas.length === 0) {
    summaryBodyEl.innerHTML = '<p class="summary-hint">Selecciona las opciones del formulario y verás aquí el desglose en tiempo real.</p>';
    totalAmountEl.textContent = "0 €";
    return;
  }

  let html = "";
  desglose.lineas.forEach(linea => {
    // "Incluido" si precio 0, precio formateado si tiene coste
    const precioStr = linea.precio === 0 ? "Incluido" : `+${linea.precio} €`;
    html += `
      <div class="summary-line">
        <span>
          <span class="line-label">${linea.categoria}</span><br/>
          <span class="line-value">${linea.nombre}</span>
        </span>
        <span class="line-price">${precioStr}</span>
      </div>
    `;
  });

  summaryBodyEl.innerHTML = html;
  animarTotal(desglose.total);
}

// ============================================================
//  ANIMACIÓN DEL TOTAL (contador suave)
// ============================================================

let animFrameId = null;
let currentDisplayedTotal = 0;

function animarTotal(objetivo) {
  if (animFrameId) cancelAnimationFrame(animFrameId);

  const duracion = 350;
  const inicio   = performance.now();
  const desde    = currentDisplayedTotal;

  function paso(ahora) {
    const t      = Math.min((ahora - inicio) / duracion, 1);
    const eased  = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const valor  = Math.round(desde + (objetivo - desde) * eased);
    totalAmountEl.textContent = valor.toLocaleString("es-ES") + " €";

    if (t < 1) {
      animFrameId = requestAnimationFrame(paso);
    } else {
      currentDisplayedTotal = objetivo;
    }
  }

  animFrameId = requestAnimationFrame(paso);
}

// ============================================================
//  BARRA DE PROGRESO
//  3 campos importantes: tipo de sesión, duración, desplazamiento
// ============================================================

function actualizarProgreso(datos) {
  let completados = 0;
  const totalCampos = 3;

  if (datos.tipoSesion)                        completados++;
  if (datos.duracion && datos.duracion !== "")  completados++;
  if (datos.desplazamiento)                     completados++;

  const porcentaje = Math.round((completados / totalCampos) * 100);
  progressBarEl.style.width = porcentaje + "%";
}

// ============================================================
//  ACTIVAR/DESACTIVAR BOTÓN
// ============================================================

function actualizarBoton(datos) {
  const listo = datos.tipoSesion !== null && datos.duracion !== "";
  btnGenerar.disabled = !listo;
}

// ============================================================
//  RESET
// ============================================================

function resetearFormulario() {
  form.reset();
  currentDisplayedTotal = 0;

  // Restauramos el select a su estado inicial (sin servicio seleccionado)
  actualizarSelectDuracion(null);

  // Ocultamos los banners y los bloques de cantidad
  infoBannerNovia.classList.remove("visible");
  infoBannerGlitter.classList.remove("visible");
  wrapAcompanamiento.classList.remove("visible");
  wrapPersonaExtra.classList.remove("visible");

  calcular();
  mostrarToast("Formulario reiniciado");
}

// ============================================================
//  TOAST
// ============================================================

let toastTimeout = null;

function mostrarToast(mensaje) {
  toastEl.textContent = mensaje;
  toastEl.classList.add("show");
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.remove("show"), 2800);
}


// ============================================================
// ============================================================
//
//   GENERADOR DE PDF — KALON
//
// ============================================================
// ============================================================

function generarPDF() {
  const datos    = leerFormulario();
  const desglose = construirDesglose(datos);

  // — PASO 2: Crear el documento A4 en milímetros —
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

  const paginaAncho = 210;
  const paginaAlto  = 297;
  const margenIzq   = 20;
  const margenDer   = 20;
  const anchoUtil   = paginaAncho - margenIzq - margenDer; // 170mm

  let y = 0; // cursor vertical

  // — PASO 3: Cabecera —
  // Fondo oscuro en toda la cabecera
  doc.setFillColor(...COLOR.primary);
  doc.rect(0, 0, paginaAncho, 42, "F");

  // Nombre de la marca en dorado, grande
  doc.setTextColor(...COLOR.warm);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("KALON", margenIzq, 20);

  // Subtítulo en azul petróleo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.accent);
  doc.text("MAQUILLAJE PROFESIONAL · PRESUPUESTO DE SERVICIOS", margenIzq, 29);

  // Fecha en la esquina derecha
  const fechaHoy = new Date().toLocaleDateString("es-ES", {
    day: "2-digit", month: "long", year: "numeric"
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.white);
  doc.text(fechaHoy, paginaAncho - margenDer, 20, { align: "right" });

  // Referencia única del presupuesto
  const numPresupuesto = "KAL-" + Date.now().toString().slice(-6);
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 205);
  doc.text("Ref. " + numPresupuesto, paginaAncho - margenDer, 27, { align: "right" });

  // Línea dorada separadora
  doc.setDrawColor(...COLOR.warm);
  doc.setLineWidth(0.8);
  doc.line(0, 42, paginaAncho, 42);

  y = 42 + 12;

  // — PASO 4: Datos del cliente y del evento —
  const tieneNombre    = datos.clienteNombre   !== "";
  const tieneEmail     = datos.clienteEmail    !== "";
  const tieneTelefono  = datos.clienteTelefono !== "";
  const tieneFecha     = datos.fechaEvento     !== "";

  if (tieneNombre || tieneEmail || tieneTelefono || tieneFecha) {

    // Título de sección
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR.accent2);
    doc.text("CLIENTE / EVENTO", margenIzq, y);

    doc.setDrawColor(...COLOR.accent2);
    doc.setLineWidth(0.3);
    doc.line(margenIzq, y + 2, margenIzq + anchoUtil, y + 2);
    y += 8;

    if (tieneNombre) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...COLOR.primary);
      doc.text(datos.clienteNombre, margenIzq, y);
      y += 7;
    }

    if (tieneEmail) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLOR.muted);
      doc.text(datos.clienteEmail, margenIzq, y);
      y += 5;
    }

    if (tieneTelefono) {
      doc.text(datos.clienteTelefono, margenIzq, y);
      y += 5;
    }

    // Fecha del evento con formato legible
    if (tieneFecha) {
      // new Date(fechaEvento) convierte el string "2026-06-15" en un objeto Date
      // Sumamos un día porque JavaScript interpreta la fecha en UTC y puede restarla un día
      const fechaObj = new Date(datos.fechaEvento + "T12:00:00");
      const fechaFormateada = fechaObj.toLocaleDateString("es-ES", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...COLOR.accent);
      doc.text("📅 Fecha del evento: " + fechaFormateada, margenIzq, y);
      y += 5;
    }

    y += 8;
  }

  // — PASO 5: Tabla de desglose —
  const colCat    = 38;
  const colDesc   = 95;
  const colPrecio = 37;

  // Cabecera de la tabla
  doc.setFillColor(...COLOR.accent);
  doc.rect(margenIzq, y, anchoUtil, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.white);
  doc.text("CATEGORÍA",   margenIzq + 3,                            y + 5.5);
  doc.text("DESCRIPCIÓN", margenIzq + colCat + 3,                   y + 5.5);
  doc.text("IMPORTE",     margenIzq + colCat + colDesc + colPrecio, y + 5.5, { align: "right" });

  y += 8;

  // Filas del desglose (efecto zebra alternando crema/blanco)
  desglose.lineas.forEach((linea, indice) => {
    doc.setFillColor(...(indice % 2 === 0 ? COLOR.bgCream : COLOR.white));
    doc.rect(margenIzq, y, anchoUtil, 9, "F");

    // Separador horizontal entre filas
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margenIzq, y + 9, margenIzq + anchoUtil, y + 9);

    // Categoría (azul medio, mayúsculas)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR.accent2);
    doc.text(linea.categoria.toUpperCase(), margenIzq + 3, y + 6);

    // Descripción (color oscuro)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR.primary);
    // splitTextToSize por si el nombre es muy largo y necesita cortarse
    const nombreRecortado = doc.splitTextToSize(linea.nombre, colDesc - 4);
    doc.text(nombreRecortado[0], margenIzq + colCat + 3, y + 6);
    // [0] → solo la primera línea para que quepa en la fila

    // Precio (dorado si tiene coste, gris si es incluido)
    const precioStr = linea.precio === 0
      ? "Incluido"
      : linea.precio.toLocaleString("es-ES") + " €";

    doc.setFontSize(9);
    if (linea.precio === 0) {
      doc.setTextColor(...COLOR.muted);
      doc.setFont("helvetica", "italic");
    } else {
      doc.setTextColor(...COLOR.warm);
      doc.setFont("helvetica", "bold");
    }
    doc.text(precioStr, margenIzq + colCat + colDesc + colPrecio, y + 6, { align: "right" });

    y += 9;
  });

  // — PASO 6: Total —
  y += 2;

  doc.setFillColor(...COLOR.primary);
  doc.rect(margenIzq, y, anchoUtil, 14, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.white);
  doc.text("TOTAL ESTIMADO", margenIzq + 3, y + 9);

  const totalStr = desglose.total.toLocaleString("es-ES") + " €";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLOR.warm);
  doc.text(totalStr, margenIzq + anchoUtil - 2, y + 9.5, { align: "right" });

  y += 14 + 10;

  // — PASO 7: Nota legal —
  doc.setFillColor(...COLOR.bgCream);
  doc.rect(margenIzq, y, anchoUtil, 18, "F");

  // Borde izquierdo decorativo (3mm de ancho, color azul petróleo)
  doc.setFillColor(...COLOR.accent);
  doc.rect(margenIzq, y, 3, 18, "F");

  const notaTexto = "Este presupuesto es orientativo y puede ajustarse tras reunión de proyecto. Los precios indicados no incluyen IVA. La validez de este presupuesto es de 30 días desde la fecha de emisión.";
  // splitTextToSize parte el texto en líneas que no superen el ancho indicado
  const notaLineas = doc.splitTextToSize(notaTexto, anchoUtil - 10);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.muted);
  doc.text(notaLineas, margenIzq + 7, y + 6);

  // — Pie de página —
  const yPie = paginaAlto - 16;

  doc.setDrawColor(...COLOR.accent2);
  doc.setLineWidth(0.4);
  doc.line(margenIzq, yPie, paginaAncho - margenDer, yPie);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR.muted);
  doc.text("KALON · Maquillaje profesional", margenIzq, yPie + 5);
  doc.text("www.womfly.com", paginaAncho - margenDer, yPie + 5, { align: "right" });

  const totalPaginas = doc.internal.getNumberOfPages();
  doc.setTextColor(180, 200, 205);
  doc.text(`Página 1 de ${totalPaginas}`, paginaAncho / 2, yPie + 5, { align: "center" });

  // — Descarga —
  // Nombre del archivo: si hay nombre de cliente lo incluimos, si no nombre genérico
  const nombreArchivo = datos.clienteNombre
    ? `presupuesto_kalon_${datos.clienteNombre.replace(/\s+/g, "_")}.pdf`
    : "presupuesto_KALON.pdf";
  // .replace(/\s+/g, "_") sustituye todos los espacios por guiones bajos

  doc.save(nombreArchivo);
  mostrarToast("✓ PDF generado y descargado");
}


// ============================================================
//  EVENTOS
//
//  Aquí "escuchamos" lo que hace el usuario y reaccionamos.
// ============================================================

// Cuando cambia cualquier campo del formulario → recalcular
form.addEventListener("change", (evento) => {
  // evento.target es el elemento concreto que cambió
  const elemento = evento.target;

  // Si lo que cambió fue el tipo de sesión, actualizamos también el select de duración
  if (elemento.name === "tipoSesion") {
    // Glitter Bar y Neón comparten la misma tabla de precios
    const tablaPrecios = elemento.value === "maquillaje_novia" ? "novia" : "glitter_neon";
    actualizarSelectDuracion(tablaPrecios);
    actualizarBanners(elemento.value);
  }

  // Si cambiaron los checkboxes de extras con cantidad, actualizamos su visibilidad
  if (elemento.value === "acompanamiento" || elemento.value === "persona_extra") {
    actualizarCantidades();
  }

  calcular();
});

// Cuando el usuario escribe en un input de texto o cambia un número → recalcular
form.addEventListener("input", calcular);

btnReset.addEventListener("click",   resetearFormulario);
btnGenerar.addEventListener("click", generarPDF);

// ============================================================
//  INICIO — estado inicial al cargar la página
// ============================================================

actualizarSelectDuracion(null); // Select de duración empieza deshabilitado
calcular();
