# Reservas Riviera Maya

Actividad sumativa de Frontend · Aplicaciones Web · Unidad 2
Tecnologías: HTML5, CSS3 y JavaScript puro (sin localStorage, frameworks, backend ni base de datos).

**Repositorio GitHub:** _pega aquí tu link_

## Cómo ejecutar
Abre la carpeta en VS Code y lanza `index.html` con Live Server (fetch() no funciona con doble clic).

## Reto individual: qué se agregó
1. 4 experiencias nuevas en el JSON (ahora son 10) y la categoría nueva **Bienestar**.
2. Filtro de **precio máximo** que trabaja junto con búsqueda y categoría.
3. Botones **−** y **+** en Mi reservación (respetan mínimo 1 y el cupo).
4. **Total de personas** además del importe total.
5. Botón **Vaciar reservación** con confirmación dentro de la página.
6. Mensajes en la página (`role="status"`), sin `alert()`.
7. Accesibilidad: etiquetas en controles, foco visible, foco devuelto tras re-renderizar, `prefers-reduced-motion`.

## Tres funciones y su explicación
- **`obtenerResultados()`**: copia el arreglo `experiencias` con `[...experiencias]` y aplica `filter()` por categoría, texto y precio máximo; después `sort()` por precio. Devuelve el resultado sin alterar el catálogo original.
- **`agregarReserva(id)`**: usa `find()` para localizar la experiencia y la reserva existente, valida cantidad y cupo, y con `push()` crea la reserva o suma personas si ya existía. Termina llamando a `mostrarReservas()`.
- **`cambiarCantidad(id, cambio)`**: suma o resta 1 a la reserva, valida el mínimo (1) y el cupo, recalcula el subtotal y vuelve a renderizar.

## Tres manipulaciones del DOM
- **`catalogo.innerHTML = resultados.map(...).join("")`**: crea las tarjetas desde JavaScript a partir de los datos del JSON.
- **`total.textContent` y `totalPersonas.textContent`**: actualizan los totales visibles sin recargar la página.
- **`mensaje.hidden`, `mensaje.className` y `confirmacion.hidden`**: muestran u ocultan mensajes de validación y el panel de confirmación cambiando atributos y clases.

## Lista de pruebas realizadas
| # | Prueba | Acción | Resultado |
|---|--------|--------|-----------|
| 1 | Carga | Abrir el sitio | Aparecen 10 experiencias, sin errores — Superada |
| 2 | Búsqueda | Escribir "kayak" | Solo Kayak en manglar — Superada |
| 3 | Sin resultados | Escribir "zzzz" | Mensaje "No se encontraron experiencias" — Superada |
| 4 | Categoría | Elegir naturaleza | 3 experiencias de naturaleza — Superada |
| 5 | Categoría nueva | Elegir bienestar | Temazcal y Yoga — Superada |
| 6 | Orden | Menor precio | De $300 a $750 — Superada |
| 7 | Precio máximo | Escribir 450 | 4 experiencias de $450 o menos — Superada |
| 8 | Filtros combinados | Naturaleza + "cenote" + precio | Solo Cenote Azul — Superada |
| 9 | Reserva | 2 personas a Cenote Azul | Subtotal $700; total $700 — Superada |
| 10 | Acumulación | Agregar 1 persona más | 3 personas; $1,050 — Superada |
| 11 | Validación de cupo | Intentar 20 personas | Mensaje en pantalla; la reserva no cambia — Superada |
| 12 | Validación cantidad | Intentar 0 personas | Mensaje en pantalla; no se crea reserva — Superada |
| 13 | Botón + | Aumentar desde Mi reservación | 4 personas; $1,400 — Superada |
| 14 | Botón − | Disminuir desde Mi reservación | Baja y recalcula — Superada |
| 15 | Mínimo | Disminuir por debajo de 1 | Se queda en 1 y avisa — Superada |
| 16 | Cupo en + | Aumentar hasta superar el cupo | Se detiene en 15 — Superada |
| 17 | Total de personas | Reservar dos experiencias | Suma las personas de ambas — Superada |
| 18 | Eliminar | Quitar una reserva | Desaparece y se recalcula — Superada |
| 19 | Vaciar: cancelar | Vaciar y pulsar "No, conservar" | La reserva se conserva — Superada |
| 20 | Vaciar: confirmar | Vaciar y pulsar "Sí, vaciar" | Queda en $0 y 0 personas — Superada |
| 21 | Orden original | Revisar tras ordenar | El catálogo base no cambia — Superada |
| 22 | Responsivo | Cambiar el ancho de pantalla | _Prueba manual: 3, 2 y 1 columnas (agrega tus capturas)_ |

## Capturas
- Escritorio: _inserta captura_
- Celular: _inserta captura_
