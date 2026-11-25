let todosLosProductos = [];
        let carrito = cargarCarritoGuardado(); // el carrito se recupera al recargar la página
        let categoriaActual = 'all'; // Variable para controlar el filtro actual de categorías
        let timeoutToast = null; // Control de tiempo para la notificación
        let resolverConfirmacion = null;

        const botonCargar = document.getElementById('btnCargar');
        const contenedorProductos = document.getElementById('listaProductos');
        const inputBuscador = document.getElementById('buscador');
        const contenedorCarrito = document.getElementById('elementosCarrito');
        const spanTotal = document.getElementById('totalPrecio');
        const spanContador = document.getElementById('contadorCarrito'); 
        const filterButtons = document.querySelectorAll('.filter-btn');
        const toastEl = document.getElementById('toastNotificacion');
        const toastTextoEl = document.getElementById('toastTexto');
        const carritoModal = document.getElementById('carritoModal');
        const modalConfirmacion = document.getElementById('modalConfirmacion');

        // Funciones para abrir y cerrar el carrito desplegable lateral
        function toggleCarritoDrawer() {
            carritoModal.classList.toggle('open');
        }

         // Cierra el carrito si haces clic en el fondo oscuro fuera del panel
        function cerrarConFondo(event) {
            if (event.target === carritoModal) {
                toggleCarritoDrawer();
            }
        }
         
         //funcion para mostrar los productos de las tarjetas//
        function mostrarProductos(productosParaMostrar) {
            contenedorProductos.innerHTML = ""; 

            if (productosParaMostrar.length === 0) {
                contenedorProductos.innerHTML = "<p>No se encontraron productos.</p>";
                return;
            }

            productosParaMostrar.forEach(producto => {
                const card = document.createElement('div');
                card.classList.add('producto-card');

                // NUEVO: Al hacer clic en la tarjeta (excepto en el botón), se abre el modal con el ID del producto
                card.onclick = (e) => {
                    // Si el usuario hace clic directamente en el botón de agregar, evitamos que se abra el modal al mismo tiempo
                    if (e.target.closest('.btn-añadir')) return;
                    verDetallePorId(producto.id);
                };

                card.innerHTML = `
                    <!-- Insignia de categoría flotante -->
                    <span class="badge-categoria">${producto.categoria}</span>
                    
                    <!-- Imagen ocupando todo el ancho superior de la tarjeta -->
                    <img src="${producto.imagen}" alt="${producto.nombre}">

                    <!-- Contenedor con margen interno para los textos y precios -->
                    <div class="info-producto">
                        <h3>${producto.nombre}</h3>
                        <p class="producto-descripcion">${producto.descripcion || ''}</p>
                        
                        <hr class="card-divider">

                        <div class="card-footer-action">
                            <div class="precio-box">
                                <span class="precio-label">Precio</span>
                                <span class="precio-monto">$${producto.precio}</span>
                            </div>
                            <button class="btn-añadir" onclick="agregarAlCarrito(${producto.id})">
                                + Añadir
                            </button>
                        </div>
                    </div>
                `;
                contenedorProductos.appendChild(card);
            });
        }

        function actualizarCarrito() {
            // Guardar el carrito en el navegador para que no se pierda al recargar
            try { localStorage.setItem('miko_carrito', JSON.stringify(carrito)); } catch (e) {}
            // Contar el total de unidades sumando las cantidades de cada item
            const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0);
            spanContador.textContent = totalUnidades;


            if (carrito.length === 0) {
                contenedorCarrito.innerHTML = "<p style='color: #886; font-size: 14px;'>El carrito está vacío.</p>";
                spanTotal.textContent = "0";
                return;
            }

            contenedorCarrito.innerHTML = "";
            let total = 0; 

            carrito.forEach(item => {
                total += item.precio * item.cantidad; 
                 
                const divItem = document.createElement('div');
                divItem.classList.add('carrito-item'); // Cambiado a 'carrito-item' para que tome los estilos de tarjeta flotante
                
                // Actualizado: Agrupamos el nombre y precio en '.carrito-item-info' para que el CSS los compacte a la izquierda
                divItem.innerHTML = `
                    <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-img">
                    
                    <div class="carrito-item-info">
                        <span class="carrito-item-nombre"><strong>${item.nombre}</strong></span>
                        <span class="carrito-item-precio">$${item.precio} c/u</span>
                    </div>

                    <div class="carrito-controles-cantidad">
                        <button class="btn-qty" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                        <span>${item.cantidad}</span>
                        <button class="btn-qty" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                    </div>

                    <button class="btn-eliminar-item" onclick="eliminarDelCarrito(${item.id})" title="Eliminar artículo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                </svg>
                    </button>
                `;
                contenedorCarrito.appendChild(divItem);
            });

            spanTotal.textContent = total; 
        }

        // Función para mostrar la notificación flotante (Toast) independiente y limpia
        function mostrarToast(mensaje) {
            toastTextoEl.textContent = mensaje; 
            toastEl.classList.add('show'); // Hace visible la notificación con la animación

            // Si el usuario hace clic varias veces rápido, limpiamos el temporizador anterior
            if (timeoutToast) {
                clearTimeout(timeoutToast);
            }

            // Ocultar automáticamente la notificación después de 2.5 segundos (2500 milisegundos)
            timeoutToast = setTimeout(() => {
                toastEl.classList.remove('show');
            }, 2500);
        }

        window.agregarAlCarrito = function(id) {
            const productoEncontrado = todosLosProductos.find(p => p.id === id);
             
            if (productoEncontrado) {
                // Verificar si el producto ya existe en el carrito
                const index = carrito.findIndex(item => item.id === id);

                if (index !== -1) {
                    // Si ya existe, incrementamos la cantidad
                    carrito[index].cantidad += 1;
                } else {
                    // Si no existe, lo agregamos con cantidad inicial de 1 y guardamos su imagen
                    carrito.push({
                        id: productoEncontrado.id,
                        nombre: productoEncontrado.nombre,
                        precio: productoEncontrado.precio,
                        imagen: productoEncontrado.imagen, // <--- NUEVO: Guardamos la ruta de la foto del amigurumi
                        cantidad: 1
                    });
                }
                actualizarCarrito(); 

                // Disparamos la notificación flotante con el nombre exacto del producto
                mostrarToast(`¡${productoEncontrado.nombre} añadido al carrito!`);
            }
        }

        // Función para sumar o restar cantidad desde los botones + y -
        window.cambiarCantidad = function(id, cambio) {
            const index = carrito.findIndex(item => item.id === id);

            if (index !== -1) {
                carrito[index].cantidad += cambio;

                // Si la cantidad baja a 0 o menos, eliminamos el producto del carrito
                if (carrito[index].cantidad <= 0) {
                    carrito.splice(index, 1);
                }

                actualizarCarrito();
            }
        }

        window.eliminarDelCarrito = function(id) {
            carrito = carrito.filter(item => item.id !== id); 
            actualizarCarrito();    
        }

        // Función para abrir la ventana modal estilizada de confirmación
        function solicitarConfirmacion() {
            return new Promise((resolve) => {
                resolverConfirmacion = resolve;
                modalConfirmacion.classList.add('open');
            });
        }

        // Función para procesar la respuesta del usuario al presionar Aceptar o Cancelar
        function cerrarModalConfirmacion(respuesta) {
            modalConfirmacion.classList.remove('open');
            if (resolverConfirmacion) {
                resolverConfirmacion(respuesta);
                resolverConfirmacion = null;
            }
        }

        // Función vaciarCarrito actualizada con la modal personalizada
        window.vaciarCarrito = async function() {
            if (carrito.length === 0) {
                return;
            }

            const confirmar = await solicitarConfirmacion();

            if (confirmar) {
                carrito = [];
                actualizarCarrito();
                toggleCarritoDrawer(); // <--- Esta línea oculta automáticamente el carrito lateral
            }
        }

        // Función para generar el mensaje, abrir WhatsApp y vaciar el carrito
        window.enviarPorWhatsApp = function() {
            if (carrito.length === 0) {
                alert("¡Tu carrito está vacío! Agrega productos antes de enviar el pedido.");
                return;
            }

            // 1. Número de teléfono de destino
            const telefono = "+584248360059"; 

            // 2. Construimos el texto base del mensaje con emojis seguros (Uso de códigos Unicode)
            let mensaje = "¡Hola! Me gustaria hacer el siguiente pedido en Miko Stitches:\n\n";

            // 3. Recorremos el carrito para listar cada producto con su cantidad
            let total = 0;
            carrito.forEach((item, index) => {
                const subtotalItem = item.precio * item.cantidad;
                mensaje += `${index + 1}. ${item.nombre} (x${item.cantidad}) - $${subtotalItem}\n`;
                total += subtotalItem;
            });

            // 4. Añadimos el precio total al mensaje
            mensaje += `\n*Total a pagar: $${total}*`;

            // 5. Métodos de pago aceptados con el icono de tarjeta seguro (\uD83D\uDCB3)
            mensaje += `\n\n 💳 *Metodos de pago aceptados:*\n`;
            mensaje += `- Binance Pay (USDT)\n`;
            mensaje += `- Zinli\n`;
            mensaje += `- Pago M\u00F3vil\n`;

            mensaje += `\nQuedo atento/a para coordinar el pago y la entrega. ¡Gracias!`;

            // 6. Codificamos el texto de forma segura para la URL de WhatsApp
            const mensajeCodificado = encodeURIComponent(mensaje);

            // 7. Abrimos la API de WhatsApp en una pestaña nueva
            const urlWhatsApp = `https://wa.me/${telefono}?text=${mensajeCodificado}`;
            window.open(urlWhatsApp, '_blank');

            // 8. Vaciamos el carrito automáticamente después de enviar el pedido
            carrito = [];
            actualizarCarrito();
            let drawer = document.getElementById('carritoDrawer');
            if (drawer) drawer.classList.remove('open');
        }

        // Función auxiliar para quitar tildes y normalizar textos
        function normalizarTexto(texto) {
            return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        }

        // Función unificada que aplica tanto el buscador de texto como el filtro por categoría
        function aplicarFiltros() {
            const textoBusqueda = normalizarTexto(inputBuscador.value);

            productosFiltradosActuales = todosLosProductos.filter(producto => {
                const coincideTexto = normalizarTexto(producto.nombre).includes(textoBusqueda);
                 
                // Comparamos normalizando ambos lados (quita tildes y mayúsculas)
                const categoriaProductoNorm = normalizarTexto(producto.categoria);
                const categoriaActualNorm = normalizarTexto(categoriaActual);
                 
                const coincideCategoria = categoriaActual === 'all' || categoriaProductoNorm === categoriaActualNorm;
                 
                return coincideTexto && coincideCategoria;
            });

            paginaActual = 1;
            const porcionInicial = productosFiltradosActuales.slice(0, PRODUCTOS_POR_PAGINA);
            mostrarProductos(porcionInicial);
            renderPaginacion(productosFiltradosActuales.length);
        }

        async function cargarDatos() {
    contenedorProductos.innerHTML = "<p>Cargando productos...</p>";

    try {
        // Asegúrate de colocar la ruta correcta hacia tu archivo json
        const respuesta = await fetch('./productos.json'); 
        
        if (!respuesta.ok) {
            throw new Error("No se pudo conectar con el archivo de productos");
        }

        todosLosProductos = await respuesta.json(); 
        sincronizarCarritoConCatalogo();
        aplicarFiltros(); 
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        contenedorProductos.innerHTML = "<p style='color:red;'>Ocurrió un error al cargar los productos.</p>";
    }
}

        window.addEventListener('DOMContentLoaded', () => {
            actualizarCarrito(); // pinta el carrito recuperado
            cargarDatos();
        });

        if (botonCargar) botonCargar.addEventListener('click', () => {
            inputBuscador.value = ""; 
            categoriaActual = 'all';
            filterButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
            cargarDatos();        
        });

        // Evento para los botones de filtro por categoría
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                categoriaActual = button.getAttribute('data-filter');
                aplicarFiltros();
            });
        });

        inputBuscador.addEventListener('input', () => {
            aplicarFiltros();
        });

// --- FUNCIONES PARA EL MODAL DE DETALLE DE PRODUCTO ---

// Función puente para abrir el modal de detalles por ID
function verDetallePorId(id) {
    const productoEncontrado = todosLosProductos.find(p => p.id === id);
    if (productoEncontrado) {
        verDetalleProducto(productoEncontrado);
    }
}

function verDetalleProducto(producto) {
    // Inyectamos los datos reales del JSON en tu estructura HTML
    configurarGaleriaModal(producto); // NUEVO: carga la foto principal y las fotos extra (carrusel)
    document.getElementById('modalCategoria').innerText = producto.categoria || 'Amigurumis';
    document.getElementById('modalTitulo').innerText = producto.nombre;
    document.getElementById('modalDescripcion').innerText = producto.descripcion || 'Amigurumi tejido a mano con acabados de alta calidad.';
    /*document.getElementById('modalMateriales').innerText = producto.materiales || 'Hilo de algodón suave';
    document.getElementById('modalLavado').innerText = producto.lavado || 'Lavar a mano con agua fría y jabón suave.';*/
    
    const spanPrecio = document.getElementById('modalPrecio');
    if (spanPrecio) {
        spanPrecio.innerText = `$${producto.precio}`;
    }

    // Asignar acción al botón "Añadir al Carrito" dentro del modal
    const btnAgregar = document.getElementById('modalBtnAgregar');
    if (btnAgregar) {
        btnAgregar.onclick = function() {
            agregarAlCarrito(producto.id); 
            cerrarModalProductoDirecto();
        };
    }

    // Mostrar el modal correctamente
    const modal = document.getElementById('modalProducto');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 👈 Bloquea el scroll de la página de atrás
    }
}

// Función global infalible para cerrar el modal de detalle del producto
window.cerrarModalProductoDirecto = function() {
    const modal = document.getElementById('modalProducto');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // 👈 Restaura el scroll de la página
    }
};

// Cerrar el modal haciendo clic o toque en el fondo oscuro difuminado
window.cerrarModalProducto = function(event) {
    const modal = document.getElementById('modalProducto');
    // Asegura que solo se cierre si se toca el fondo negro exterior, no la tarjeta blanca
    if (event.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // 👈 Restaura el scroll de la página
    }
};

// Función para abrir y cerrar el menú desplegable en dispositivos móviles
function toggleMenuMovil() {
    const navContainer = document.getElementById('navLinksContainer');
    navContainer.classList.toggle('active');
}

//funciones del carrucel
let indiceSlideActual = 0;
const slides = document.querySelectorAll('.carrusel-slide');
const puntos = document.querySelectorAll('.punto');
const track = document.getElementById('carruselTrack');

function actualizarCarrusel() {
    if (!track) return;
    track.style.transform = `translateX(-${indiceSlideActual * 100}%)`;
    
    // Actualizar puntos activos
    puntos.forEach((punto, index) => {
        punto.classList.toggle('active', index === indiceSlideActual);
    });
}

function cambiarSlide(direccion) {
    if (slides.length === 0) return;
    indiceSlideActual += direccion;
    if (indiceSlideActual < 0) {
        indiceSlideActual = slides.length - 1;
    } else if (indiceSlideActual >= slides.length) {
        indiceSlideActual = 0;
    }
    actualizarCarrusel();
}

function irASlide(index) {
    indiceSlideActual = index;
    actualizarCarrusel();
}

// Movimiento automático cada 4.5 segundos
let intervaloCarrusel = setInterval(() => {
    cambiarSlide(1);
}, 4500);

// Opcional: Pausar el movimiento automático si el usuario pasa el mouse por encima
const contenedorCarrusel = document.querySelector('.carrusel-banner-container');
if (contenedorCarrusel) {
    contenedorCarrusel.addEventListener('mouseenter', () => clearInterval(intervaloCarrusel));
    contenedorCarrusel.addEventListener('mouseleave', () => {
        intervaloCarrusel = setInterval(() => cambiarSlide(1), 4500);
    });
}

// --- FUNCIONALIDAD DEL ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ) ---
document.addEventListener("DOMContentLoaded", () => {
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach(question => {
        question.addEventListener("click", () => {
            const currentItem = question.parentElement;
            
            // Alterna la clase 'active' en el ítem actual
            currentItem.classList.toggle("active");
        });
    });
});

// --- SISTEMA DE RESEÑAS (las nuevas se envían por WhatsApp) ---
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-opinion");
    const grid = document.getElementById("testimonios-grid");
    const starsPicker = document.getElementById("stars-picker");
    let currentRating = 5;

    // Reseñas de respaldo: solo se usan si no se puede leer opiniones.json
    /*const reseñasRespaldo = [
        { nombre: "María G.", pedido: "Cumaná • Pedido Personalizado", rating: 5, texto: "¡El amigurumi de Luffy quedó idéntico! Quedé enamorada de cada detalle. La atención excelente." },
        { nombre: "Carlos R.", pedido: "Cumaná • Llavero", rating: 5, texto: "Le regalé un llaverito de Groot a mi pareja y le encantó. El acabado del tejido es súper firme." },
        { nombre: "Jose A.", pedido: "Cumaná • Llavero", rating: 5, texto: "Excelente pedido. me gusto mucho. muchas gracias." },
    ];*/

    const OPINIONES_POR_PAGINA = 3;      // cuántas se muestran al inicio y cuántas más con cada clic
    let opiniones = [];
    let opinionesVisibles = OPINIONES_POR_PAGINA;
    const contenedorVerMas = document.getElementById("testimonios-ver-mas");
    const btnVerMas = document.getElementById("btn-ver-mas-opiniones");

    // Limpia datos antiguos que se guardaban en el navegador de cada visitante
    try { localStorage.removeItem("miko_testimonios"); } catch (e) {}

    // Lee las opiniones desde opiniones.json (la más nueva va primero en el archivo)
    async function cargarOpiniones() {
        try {
            const respuesta = await fetch("./opiniones.json");
            if (!respuesta.ok) throw new Error("No se pudo leer opiniones.json");
            const datos = await respuesta.json();
            opiniones = (Array.isArray(datos) && datos.length) ? datos : reseñasRespaldo;
        } catch (error) {
            console.error("Error al cargar las opiniones:", error);
            opiniones = reseñasRespaldo;
        }
        renderOpiniones();
    }

    // 1. Selector interactivo de estrellas
    if (starsPicker) {
        const stars = starsPicker.querySelectorAll("span");
        
        stars.forEach(star => {
            star.addEventListener("mouseover", () => {
                const val = parseInt(star.getAttribute("data-value"));
                stars.forEach((s, idx) => {
                    s.classList.toggle("hovered", idx < val);
                });
            });

            starsPicker.addEventListener("mouseleave", () => {
                stars.forEach((s, idx) => {
                    s.classList.remove("hovered");
                    s.classList.toggle("selected", idx < currentRating);
                });
            });

            star.addEventListener("click", () => {
                currentRating = parseInt(star.getAttribute("data-value"));
                stars.forEach((s, idx) => {
                    s.classList.toggle("selected", idx < currentRating);
                });
            });
        });
    }

    // 2. Función para renderizar TODAS las opiniones en pantalla (organizadas por la grilla y scroll CSS)
    // NUEVO: crea el avatar de una opinión
    function crearAvatarOpinion(op) {
        const nombreCompleto = String(op.nombre || "").trim();

        // Si la opinión trae "foto" en opiniones.json, se muestra la imagen
        if (op.foto) {
            const img = document.createElement("img");
            img.className = "testimonio-avatar";
            img.src = op.foto;
            img.alt = `Foto de ${nombreCompleto}`;
            img.loading = "lazy";
            return img;
        }

        // Si no, círculo de color con las iniciales (ej: "Valentina Pérez" -> "VP")
        const iniciales = nombreCompleto
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(p => Array.from(p)[0].toUpperCase())
            .join("") || "?";

        // El color depende del nombre: la misma persona siempre tiene el mismo color
        let suma = 0;
        for (const letra of nombreCompleto) suma += letra.charCodeAt(0);

        const avatar = document.createElement("div");
        avatar.className = `testimonio-avatar avatar-color-${suma % 6}`;
        avatar.textContent = iniciales;
        avatar.setAttribute("aria-hidden", "true");
        return avatar;
    }

    function renderOpiniones() {
        if (!grid) return;
        grid.innerHTML = "";

        opiniones.slice(0, opinionesVisibles).forEach(op => {
            const rating = Math.max(0, Math.min(5, Number(op.rating) || 5));

            const card = document.createElement("div");
            card.className = "testimonio-card";

            const stars = document.createElement("div");
            stars.className = "testimonio-stars";
            stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);

            const texto = document.createElement("p");
            texto.className = "testimonio-texto";
            texto.textContent = `"${op.texto}"`;

            const info = document.createElement("div");
            info.className = "testimonio-info";
            const nombre = document.createElement("strong");
            nombre.textContent = op.nombre;
            const pedido = document.createElement("span");
            pedido.textContent = op.pedido;
            info.append(nombre, pedido);

            // NUEVO: avatar (foto si existe en el JSON; si no, círculo con las iniciales)
            const autor = document.createElement("div");
            autor.className = "testimonio-autor";
            autor.append(crearAvatarOpinion(op), info);

            card.append(stars, texto, autor);
            grid.appendChild(card);
        });

        actualizarBotonVerMas();
    }

    // Muestra, oculta o cambia el texto del botón "Ver más"
    function actualizarBotonVerMas() {
        if (!contenedorVerMas || !btnVerMas) return;
        if (opiniones.length <= OPINIONES_POR_PAGINA) {
            contenedorVerMas.hidden = true;
            return;
        }
        contenedorVerMas.hidden = false;
        if (opinionesVisibles >= opiniones.length) {
            btnVerMas.textContent = "Ver menos ▲";
        } else {
            btnVerMas.textContent = `Ver más opiniones (${opiniones.length - opinionesVisibles}) ▼`;
        }
    }

    if (btnVerMas) {
        btnVerMas.addEventListener("click", () => {
            if (opinionesVisibles >= opiniones.length) {
                opinionesVisibles = OPINIONES_POR_PAGINA;   // colapsar
                renderOpiniones();
                const seccion = document.getElementById("opiniones");
                if (seccion) seccion.scrollIntoView({ behavior: "smooth" });
            } else {
                opinionesVisibles += OPINIONES_POR_PAGINA;
                renderOpiniones();
            }
        });
    }

    // 3. Procesar el formulario con validación anti-spam y límite de 6 comentarios
    if (form) {
        // --- Validación propia (reemplaza los globos nativos del navegador, que no siguen el scroll) ---
        const campoNombre = document.getElementById("nombre-cliente");
        const campoPedido = document.getElementById("detalles-pedido");
        const campoComentario = document.getElementById("comentario-cliente");
        const cajaError = document.getElementById("form-opinion-error");
        const camposForm = [campoNombre, campoPedido, campoComentario];

        const limpiarErrores = () => {
            camposForm.forEach(c => c && c.classList.remove("campo-invalido"));
            if (cajaError) {
                cajaError.hidden = true;
                cajaError.textContent = "";
            }
        };

        const mostrarErrorCampo = (campo, texto) => {
            limpiarErrores();
            campo.classList.add("campo-invalido");
            if (cajaError) {
                cajaError.textContent = texto;
                cajaError.hidden = false;
            }
            campo.focus();
        };

        // El error desaparece en cuanto la persona empieza a corregir el campo
        camposForm.forEach(c => c && c.addEventListener("input", limpiarErrores));

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const textoComentario = campoComentario.value.trim();

            if (!campoNombre.value.trim()) {
                mostrarErrorCampo(campoNombre, "Por favor, escribe tu nombre.");
                return;
            }
            if (!campoPedido.value.trim()) {
                mostrarErrorCampo(campoPedido, "Cuéntanos qué pedido recibiste (ej: Llavero).");
                return;
            }
            // Validación anti-spam: el comentario debe tener al menos 10 letras
            if (textoComentario.length < 10) {
                mostrarErrorCampo(campoComentario, "Por favor, escribe un comentario un poco más detallado sobre tu experiencia (mínimo 10 caracteres).");
                return;
            }
            limpiarErrores();

            const nombre = document.getElementById("nombre-cliente").value.trim();
            const pedido = document.getElementById("detalles-pedido").value.trim();
            const estrellas = "★".repeat(currentRating) + "☆".repeat(5 - currentRating);
            const telefono = "584248360059";

            // Emojis escritos como códigos Unicode para que WhatsApp los muestre bien en cualquier navegador
            let mensaje = `¡Hola, Miko Stitches! \n\nQuiero dejar mi opinión para que la publiquen en la página:\n\n`;
            mensaje += `. *Nombre:* ${nombre}\n`;
            mensaje += `. *Pedido:* ${pedido}\n`;
            mensaje += `. *Calificación:* ${estrellas} (${currentRating}/5)\n`;
            mensaje += `. *Comentario:* "${textoComentario}"\n\n¡Gracias!`;

            window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank");

            // Limpiar formulario y restablecer estrellas a 5
            form.reset();
            currentRating = 5;
            if (starsPicker) {
                starsPicker.querySelectorAll("span").forEach(s => s.classList.add("selected"));
            }
            mostrarToast("¡Gracias! Se abrió WhatsApp para enviarnos tu opinión. ✨");
        });
    }

    cargarOpiniones();
});

// --- CORRECCIÓN RESPONSIVE PARA EL CARRITO LATERAL EN MÓVILES ---
document.addEventListener('DOMContentLoaded', () => {
    const carritoModal = document.getElementById('carritoModal');
    
    // Asegurar que la apertura sea inmediata y limpia en celulares
    if (carritoModal) {
        // Sobrescribimos el comportamiento de la función toggle si es necesario
        // o aseguramos que la clase 'open' despliegue el panel sin retardos.
    }
});

// Función para solicitar patrones digitales directamente por WhatsApp
window.comprarPatronWhatsApp = function(nombrePatron, precio) {
    const telefono = "+584248360059"; 
    
    let mensaje = `¡Hola, Miko Stitches! 🧶✨\n\n`;
    mensaje += `Me interesa adquirir el patrón digital en PDF:\n`;
    mensaje += `📌 *${nombrePatron}* - $${precio}\n\n`;
    mensaje += `¿Me indicas los datos para realizar el pago por Binance Pay / Zinli / Pago Móvil? ¡Gracias!`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${telefono}?text=${mensajeCodificado}`;
    
    window.open(urlWhatsApp, '_blank');
};

// --- CARRITO PERSISTENTE ---
function cargarCarritoGuardado() {
    try {
        const guardado = JSON.parse(localStorage.getItem('miko_carrito'));
        if (Array.isArray(guardado)) {
            return guardado.filter(i => i && i.id !== undefined && Number(i.cantidad) > 0 && Number(i.precio) >= 0);
        }
    } catch (e) {}
    return [];
}

// Alinea el carrito guardado con el catálogo actual (precios, nombres y productos que ya no existen)
function sincronizarCarritoConCatalogo() {
    if (!carrito.length || !todosLosProductos.length) return;
    carrito = carrito
        .filter(item => todosLosProductos.some(p => p.id === item.id))
        .map(item => {
            const p = todosLosProductos.find(p => p.id === item.id);
            return { ...item, nombre: p.nombre, precio: p.precio, imagen: p.imagen };
        });
    actualizarCarrito();
}

//Paginado en catalogos
const PRODUCTOS_POR_PAGINA = 12; // Puedes cambiarlo a 8 (dos filas de 4) si prefieres
let paginaActual = 1;
let productosFiltradosActuales = [];
const contenedorPaginacion = document.getElementById('paginacionCatalogo');

function renderPaginacion(totalProductos) {
    if (!contenedorPaginacion) return;

    const totalPaginas = Math.ceil(totalProductos / PRODUCTOS_POR_PAGINA);

    // Ocultar la barra si no hay más de una página
    if (totalPaginas <= 1) {
        contenedorPaginacion.hidden = true;
        contenedorPaginacion.innerHTML = '';
        return;
    }

    contenedorPaginacion.hidden = false;
    contenedorPaginacion.innerHTML = '';

    // Botón anterior (←) cuando no estás en la primera página
    if (paginaActual > 1) {
        const btnPrev = document.createElement('button');
        btnPrev.type = 'button';
        btnPrev.innerHTML = '&#8592;';
        btnPrev.className = 'pagina-btn pagina-btn-flecha';
        btnPrev.setAttribute('aria-label', 'Página anterior');
        btnPrev.onclick = () => irAPagina(paginaActual - 1);
        contenedorPaginacion.appendChild(btnPrev);
    }

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = String(i);
        btn.className = 'pagina-btn' + (i === paginaActual ? ' active' : '');
        btn.setAttribute('aria-label', `Ir a la página ${i}`);
        btn.onclick = () => irAPagina(i);
        contenedorPaginacion.appendChild(btn);
    }

    // Botón siguiente (→) cuando hay páginas adelante
    if (paginaActual < totalPaginas) {
        const btnNext = document.createElement('button');
        btnNext.type = 'button';
        btnNext.innerHTML = '&#8594;';
        btnNext.className = 'pagina-btn pagina-btn-flecha';
        btnNext.setAttribute('aria-label', 'Página siguiente');
        btnNext.onclick = () => irAPagina(paginaActual + 1);
        contenedorPaginacion.appendChild(btnNext);
    }
}

function irAPagina(numeroPagina) {
    const totalPaginas = Math.max(1, Math.ceil(productosFiltradosActuales.length / PRODUCTOS_POR_PAGINA));
    paginaActual = Math.min(Math.max(1, numeroPagina), totalPaginas);

    const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const fin = inicio + PRODUCTOS_POR_PAGINA;
    mostrarProductos(productosFiltradosActuales.slice(inicio, fin));
    renderPaginacion(productosFiltradosActuales.length);

    // Desplazar suavemente hacia el encabezado del catálogo al cambiar de página
    const seccionCatalogo = document.getElementById('catalogo');
    if (seccionCatalogo) {
        seccionCatalogo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}


// --- MINI CARRUSEL DE FOTOS EN LA VENTANA DEL PRODUCTO ---
// En productos.json: "imagen" es la foto principal y "imagenes" (opcional) son las fotos adicionales.
let galeriaFotos = [];
let galeriaIndice = 0;

function configurarGaleriaModal(producto) {
    const lista = [producto.imagen, ...(Array.isArray(producto.imagenes) ? producto.imagenes : [])];
    // Sin fotos vacías ni repetidas
    galeriaFotos = lista.filter((src, i) => src && lista.indexOf(src) === i);
    galeriaIndice = 0;
    // Precarga para que al pasar de foto no haya parpadeo
    galeriaFotos.forEach(src => { const pre = new Image(); pre.src = src; });
    mostrarFotoGaleria(producto.nombre);
}

function mostrarFotoGaleria(nombreProducto) {
    const img = document.getElementById('modalImagen');
    const btnPrev = document.getElementById('galeriaPrev');
    const btnNext = document.getElementById('galeriaNext');
    const puntos = document.getElementById('galeriaPuntos');
    if (!img) return;

    img.src = galeriaFotos[galeriaIndice] || '';
    if (nombreProducto) img.alt = nombreProducto;

    const hayVarias = galeriaFotos.length > 1;
    if (btnPrev) btnPrev.hidden = !hayVarias;
    if (btnNext) btnNext.hidden = !hayVarias;
    if (!puntos) return;

    puntos.hidden = !hayVarias;
    puntos.innerHTML = '';
    if (!hayVarias) return;

    galeriaFotos.forEach((_, i) => {
        const punto = document.createElement('button');
        punto.type = 'button';
        punto.className = 'galeria-punto' + (i === galeriaIndice ? ' active' : '');
        punto.setAttribute('aria-label', `Ver foto ${i + 1}`);
        punto.onclick = () => { galeriaIndice = i; mostrarFotoGaleria(); };
        puntos.appendChild(punto);
    });
}

function cambiarFotoGaleria(paso) {
    if (galeriaFotos.length < 2) return;
    galeriaIndice = (galeriaIndice + paso + galeriaFotos.length) % galeriaFotos.length;
    mostrarFotoGaleria();
}

(function () {
    const btnPrev = document.getElementById('galeriaPrev');
    const btnNext = document.getElementById('galeriaNext');
    const galeria = document.getElementById('modalGaleria');
    if (btnPrev) btnPrev.addEventListener('click', () => cambiarFotoGaleria(-1));
    if (btnNext) btnNext.addEventListener('click', () => cambiarFotoGaleria(1));

    // Deslizar con el dedo en el celular
    if (galeria) {
        let inicioX = null;
        galeria.addEventListener('touchstart', (e) => { inicioX = e.touches[0].clientX; }, { passive: true });
        galeria.addEventListener('touchend', (e) => {
            if (inicioX === null) return;
            const diferencia = e.changedTouches[0].clientX - inicioX;
            if (Math.abs(diferencia) > 40) cambiarFotoGaleria(diferencia < 0 ? 1 : -1);
            inicioX = null;
        });
    }

    // Flechas del teclado cuando la ventana del producto está abierta
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('modalProducto');
        if (!modal || !modal.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') cambiarFotoGaleria(-1);
        if (e.key === 'ArrowRight') cambiarFotoGaleria(1);
    });
})();