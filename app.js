/* ===== ESTADO ===== */
let experiencias = [];
let reservas = [];
let textoBusqueda = "";
let categoriaActual = "todas";
let ordenActual = "normal";
let precioMaximo = null; // null = sin límite
let temporizadorMensaje = null;

/* ===== REFERENCIAS AL DOM ===== */
const catalogo = document.querySelector("#catalogo");
const buscador = document.querySelector("#buscador");
const filtroCategoria = document.querySelector("#filtroCategoria");
const ordenPrecio = document.querySelector("#ordenPrecio");
const filtroPrecioMaximo = document.querySelector("#precioMaximo");
const listaReservas = document.querySelector("#listaReservas");
const total = document.querySelector("#total");
const totalPersonas = document.querySelector("#totalPersonas");
const estado = document.querySelector("#estado");
const mensaje = document.querySelector("#mensaje");
const btnVaciar = document.querySelector("#btnVaciar");
const confirmacion = document.querySelector("#confirmacion");
const btnConfirmarVaciar = document.querySelector("#btnConfirmarVaciar");
const btnCancelarVaciar = document.querySelector("#btnCancelarVaciar");

/* ===== UTILIDADES ===== */
function formatearMoneda(cantidad) {
  return `$${cantidad.toLocaleString("es-MX")} MXN`;
}

// Muestra un mensaje dentro de la página (sin alert)
function mostrarMensaje(texto, tipo = "exito") {
  clearTimeout(temporizadorMensaje);
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  mensaje.hidden = false;
  temporizadorMensaje = setTimeout(ocultarMensaje, 5000);
}

function ocultarMensaje() {
  mensaje.hidden = true;
  mensaje.textContent = "";
}

/* ===== CARGA DE DATOS ===== */
async function cargarExperiencias() {
  try {
    estado.textContent = "Cargando experiencias...";
    const respuesta = await fetch("./data/experiencias.json");
    if (!respuesta.ok) throw new Error("No fue posible cargar las experiencias");
    experiencias = await respuesta.json();
    estado.textContent = `${experiencias.length} experiencias disponibles`;
    actualizarCatalogo();
  } catch (error) {
    estado.textContent = "Error al cargar la información";
    mostrarMensaje("No se pudo cargar el catálogo. Abre el proyecto con un servidor local (Live Server).", "error");
    console.error(error);
  }
}

/* ===== FILTRAR Y ORDENAR (sin modificar el arreglo original) ===== */
function obtenerResultados() {
  let resultados = [...experiencias];

  if (categoriaActual !== "todas") {
    resultados = resultados.filter(e => e.categoria === categoriaActual);
  }
  if (textoBusqueda !== "") {
    resultados = resultados.filter(e =>
      e.nombre.toLowerCase().includes(textoBusqueda));
  }
  if (precioMaximo !== null) {
    resultados = resultados.filter(e => e.precio <= precioMaximo);
  }
  if (ordenActual === "ascendente") resultados.sort((a, b) => a.precio - b.precio);
  if (ordenActual === "descendente") resultados.sort((a, b) => b.precio - a.precio);

  return resultados;
}

/* ===== RENDER DEL CATÁLOGO ===== */
function actualizarCatalogo() {
  const resultados = obtenerResultados();

  if (resultados.length === 0) {
    catalogo.innerHTML = `<p class="sin-resultados">No se encontraron experiencias</p>`;
    estado.textContent = "0 resultados";
    return;
  }

  catalogo.innerHTML = resultados.map(e => `
    <article class="tarjeta" data-cat="${e.categoria}">
      <div class="imagen" aria-hidden="true">${e.icono}</div>
      <div class="informacion">
        <span class="categoria">${e.categoria}</span>
        <h3>${e.nombre}</h3>
        <p>Cupo disponible: ${e.cupo}</p>
        <p class="precio">$${e.precio} MXN</p>
        <label>Personas:
          <input type="number" id="cantidad-${e.id}" min="1" max="${e.cupo}" value="1">
        </label>
        <button class="btn-reservar" data-id="${e.id}">Agregar</button>
      </div>
    </article>`).join("");

  estado.textContent = `${resultados.length} resultados`;
  agregarEventosReservar();
}

function agregarEventosReservar() {
  document.querySelectorAll(".btn-reservar").forEach(boton => {
    boton.addEventListener("click", () => agregarReserva(Number(boton.dataset.id)));
  });
}

/* ===== RESERVAS ===== */
function agregarReserva(id) {
  const experiencia = experiencias.find(e => e.id === id);
  const cantidad = Number(document.querySelector(`#cantidad-${id}`).value);

  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > experiencia.cupo) {
    mostrarMensaje(
      `Cantidad no válida para ${experiencia.nombre}. Elige un número entero entre 1 y ${experiencia.cupo}.`,
      "error"
    );
    return;
  }

  const existente = reservas.find(r => r.experienciaId === id);
  if (existente) {
    const nuevaCantidad = existente.cantidad + cantidad;
    if (nuevaCantidad > experiencia.cupo) {
      mostrarMensaje(
        `La cantidad supera el cupo de ${experiencia.nombre}: ya tienes ${existente.cantidad} y el cupo es ${experiencia.cupo}.`,
        "error"
      );
      return;
    }
    existente.cantidad = nuevaCantidad;
    existente.subtotal = nuevaCantidad * experiencia.precio;
  } else {
    reservas.push({
      experienciaId: id,
      nombre: experiencia.nombre,
      precio: experiencia.precio,
      cantidad,
      subtotal: experiencia.precio * cantidad
    });
  }

  mostrarMensaje(`Agregaste ${cantidad} persona(s) a ${experiencia.nombre}.`, "exito");
  mostrarReservas();
}

// Aumenta (+1) o disminuye (-1) la cantidad desde Mi reservación
function cambiarCantidad(id, cambio) {
  const reserva = reservas.find(r => r.experienciaId === id);
  const experiencia = experiencias.find(e => e.id === id);
  const nuevaCantidad = reserva.cantidad + cambio;

  if (nuevaCantidad < 1) {
    mostrarMensaje(`La cantidad mínima es 1. Usa "Eliminar" para quitar ${reserva.nombre}.`, "error");
    return;
  }
  if (nuevaCantidad > experiencia.cupo) {
    mostrarMensaje(`No hay más lugares en ${reserva.nombre}. El cupo máximo es ${experiencia.cupo}.`, "error");
    return;
  }

  reserva.cantidad = nuevaCantidad;
  reserva.subtotal = nuevaCantidad * reserva.precio;
  mostrarReservas();

  // Al volver a renderizar se pierde el foco; lo devolvemos al mismo botón (teclado)
  const accion = cambio > 0 ? "aumentar" : "disminuir";
  const boton = document.querySelector(`.btn-cantidad[data-id="${id}"][data-accion="${accion}"]`);
  if (boton) boton.focus();
}

function mostrarReservas() {
  if (reservas.length === 0) {
    listaReservas.innerHTML = "<p>No hay experiencias seleccionadas.</p>";
    total.textContent = "$0 MXN";
    totalPersonas.textContent = "0";
    btnVaciar.disabled = true;
    confirmacion.hidden = true;
    return;
  }

  listaReservas.innerHTML = reservas.map(r => `
    <article class="item-reserva">
      <div>
        <strong>${r.nombre}</strong>
        <p>${r.cantidad} persona(s) × $${r.precio}</p>
        <div class="control-cantidad" role="group" aria-label="Cantidad de personas para ${r.nombre}">
          <button class="btn-cantidad" data-id="${r.experienciaId}" data-accion="disminuir"
                  aria-label="Disminuir una persona en ${r.nombre}">−</button>
          <span class="cantidad-actual">${r.cantidad}</span>
          <button class="btn-cantidad" data-id="${r.experienciaId}" data-accion="aumentar"
                  aria-label="Aumentar una persona en ${r.nombre}">+</button>
        </div>
      </div>
      <div>
        <strong>${formatearMoneda(r.subtotal)}</strong><br>
        <button class="btn-eliminar" data-id="${r.experienciaId}">Eliminar</button>
      </div>
    </article>`).join("");

  const totalReserva = reservas.reduce((suma, r) => suma + r.subtotal, 0);
  const personas = reservas.reduce((suma, r) => suma + r.cantidad, 0);
  total.textContent = formatearMoneda(totalReserva);
  totalPersonas.textContent = personas;
  btnVaciar.disabled = false;

  agregarEventosCantidad();
  agregarEventosEliminar();
}

function agregarEventosCantidad() {
  document.querySelectorAll(".btn-cantidad").forEach(boton => {
    boton.addEventListener("click", () => {
      const cambio = boton.dataset.accion === "aumentar" ? 1 : -1;
      cambiarCantidad(Number(boton.dataset.id), cambio);
    });
  });
}

function agregarEventosEliminar() {
  document.querySelectorAll(".btn-eliminar[data-id]").forEach(boton => {
    boton.addEventListener("click", () => eliminarReserva(Number(boton.dataset.id)));
  });
}

function eliminarReserva(id) {
  const reserva = reservas.find(r => r.experienciaId === id);
  reservas = reservas.filter(r => r.experienciaId !== id);
  mostrarMensaje(`Quitaste ${reserva.nombre} de tu reservación.`, "exito");
  mostrarReservas();
}

/* ===== VACIAR RESERVACIÓN (con confirmación en la página) ===== */
function pedirConfirmacionVaciar() {
  confirmacion.hidden = false;
  btnCancelarVaciar.focus(); // opción segura por defecto
}

function vaciarReservacion() {
  reservas = [];
  confirmacion.hidden = true;
  mostrarMensaje("Se vació tu reservación.", "exito");
  mostrarReservas();
  btnVaciar.focus();
}

function cancelarVaciado() {
  confirmacion.hidden = true;
  btnVaciar.focus();
}

/* ===== EVENTOS DE LOS CONTROLES ===== */
buscador.addEventListener("input", () => {
  textoBusqueda = buscador.value.trim().toLowerCase();
  actualizarCatalogo();
});

filtroCategoria.addEventListener("change", () => {
  categoriaActual = filtroCategoria.value;
  actualizarCatalogo();
});

ordenPrecio.addEventListener("change", () => {
  ordenActual = ordenPrecio.value;
  actualizarCatalogo();
});

filtroPrecioMaximo.addEventListener("input", () => {
  const valor = filtroPrecioMaximo.value.trim();
  if (valor === "") {
    precioMaximo = null;
    ocultarMensaje();
  } else if (Number(valor) < 0 || Number.isNaN(Number(valor))) {
    mostrarMensaje("El precio máximo debe ser un número mayor o igual a 0.", "error");
    return;
  } else {
    precioMaximo = Number(valor);
  }
  actualizarCatalogo();
});

btnVaciar.addEventListener("click", pedirConfirmacionVaciar);
btnConfirmarVaciar.addEventListener("click", vaciarReservacion);
btnCancelarVaciar.addEventListener("click", cancelarVaciado);

/* ===== INICIO ===== */
cargarExperiencias();
