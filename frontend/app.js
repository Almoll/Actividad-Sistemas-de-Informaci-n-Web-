const API_URL = "http://127.0.0.1:5000";

// Función para mostrar una sección y ocultar las demás
function mostrarSeccion(idSeccion) {
    document.querySelectorAll(".section").forEach(seccion => {
        seccion.classList.add("hidden");
    });
    const seccionActiva = document.getElementById(idSeccion);
    if (seccionActiva) {
        seccionActiva.classList.remove("hidden");
    }
}

// Asignar eventos para manejar la navegación entre secciones
document.getElementById("cargar-libros").addEventListener("click", () => {
    mostrarSeccion("seccion-libros");
    cargarLibros();
});

document.getElementById("cargar-prestamos").addEventListener("click", () => {
    mostrarSeccion("seccion-prestamos");
    cargarPrestamos();
});

document.getElementById("mostrar-form-prestamo").addEventListener("click", () => {
    mostrarSeccion("seccion-prestamo");
});

document.getElementById("mostrar-form-reserva").addEventListener("click", () => {
    mostrarSeccion("seccion-reserva");
});
document.getElementById("mostrar-login").addEventListener("click", () => {
    mostrarSeccion("seccion-login");
});
// Función para mostrar la sección de reservas
document.getElementById("cargar-reservas").addEventListener("click", () => {
    mostrarSeccion("seccion-reservas");
    cargarReservas();
});
// Mostrar formulario para registrar libros
document.getElementById("mostrar-form-registrar-libro").addEventListener("click", () => {
    mostrarSeccion("seccion-registrar-libro");
});
// Mostrar formulario de registro
document.getElementById("mostrar-registro").addEventListener("click", () => {
    mostrarSeccion("seccion-registro");
});

// Función para iniciar sesión
document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo, contrasena }),
        });

        const resultado = await response.json();
        const mensajeDiv = document.getElementById("login-mensaje");

        if (response.ok) {
            mensajeDiv.innerText = "Inicio de sesión exitoso.";
        } else {
            mensajeDiv.innerText = resultado.error || "Error al iniciar sesión.";
        }
    } catch (error) {
        console.error("Error en el inicio de sesión:", error);
    }
});

// Función para reservar un libro
document.getElementById("form-reserva").addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuarioId = document.getElementById("reserva-usuario-id").value;
    const libroId = document.getElementById("reserva-libro-id").value;
    const fechaReserva = document.getElementById("fecha-reserva").value;

    if (!usuarioId || !libroId || !fechaReserva) {
        alert("Por favor, completa todos los campos antes de enviar.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reservas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ usuario_id: usuarioId, libro_id: libroId, fecha_reserva: fechaReserva }),
        });

        const resultado = await response.json();
        if (response.ok) {
            alert(resultado.mensaje);
        } else {
            alert(resultado.error || "Error al realizar la reserva.");
        }
    } catch (error) {
        console.error("Error al reservar libro:", error);
        alert("No se pudo realizar la reserva.");
    }
});
// Función para registrar un prestamo de un libro
document.getElementById("form-prestamo").addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuarioId = document.getElementById("usuario-id").value;
    const libroId = document.getElementById("libro-id").value;
    const fechaPrestamo = document.getElementById("fecha-prestamo").value;

    if (!usuarioId || !libroId || !fechaPrestamo) {
        alert("Por favor, completa todos los campos antes de enviar.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/prestamos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ usuario_id: usuarioId, libro_id: libroId, fecha_prestamo: fechaPrestamo }),
        });

        const resultado = await response.json();
        if (response.ok) {
            alert(resultado.mensaje);
        } else {
            alert(resultado.error || "Error al realizar el prestamo.");
        }
    } catch (error) {
        console.error("Error al hacer el prestamo del libro:", error);
        alert("No se pudo realizar el prestamo.");
    }
});


// Función para cargar reservas
async function cargarReservas() {
    try {
        const response = await fetch(`${API_URL}/reservas`);
        const reservas = await response.json();

        const listaReservas = document.getElementById("lista-reservas");
        if (response.ok) {
            listaReservas.innerHTML = reservas.map(reserva => `
                <div>
                    <p>ID Reserva: ${reserva.id}</p>
                    <p>ID Libro: ${reserva.libro_id}</p>
                    <p>Fecha de Reserva: ${reserva.fecha_reserva}</p>
                </div>
            `).join("");
        } else {
            listaReservas.innerText = reservas.error || "Error al cargar las reservas.";
        }
    } catch (error) {
        console.error("Error al cargar reservas:", error);
    }
}

document.getElementById("cargar-reservas").addEventListener("click", () => {
    mostrarSeccion("seccion-reservas");
    cargarReservas();
});

// Función para cargar y mostrar libros
async function cargarLibros() {
    try {
        const response = await fetch(`${API_URL}/libros`);
        if (!response.ok) {
            throw new Error("Error al obtener los libros.");
        }
        const libros = await response.json();
        const listaLibros = document.getElementById("lista-libros");
        listaLibros.innerHTML = libros.map(libro => `
            <div>
                <p><strong>Título:</strong> ${libro.titulo}</p>
                <p><strong>Autor:</strong> ${libro.autor}</p>
                <p><strong>ISBN:</strong> ${libro.isbn}</p>
                <p><strong>Disponibilidad:</strong> ${libro.disponibilidad ? "Disponible" : "No disponible"}</p>
            </div>
        `).join("");
    } catch (error) {
        console.error("Error al cargar libros:", error);
        alert("No se pudieron cargar los libros.");
    }
}

// Función para cargar y mostrar préstamos
async function cargarPrestamos() {
    try {
        const response = await fetch(`${API_URL}/prestamos`);
        if (!response.ok) {
            throw new Error("Error al obtener los préstamos.");
        }
        const prestamos = await response.json();
        const listaPrestamos = document.getElementById("lista-prestamos");
        listaPrestamos.innerHTML = prestamos.map(prestamo => `
            <div>
                <p><strong>Préstamo ID:</strong> ${prestamo.id}</p>
                <p><strong>ID Libro:</strong> ${prestamo.libro_id}</p>
                <p><strong>ID Usuario:</strong> ${prestamo.usuario_id}</p>
                <p><strong>Fecha de Préstamo:</strong> ${prestamo.fecha_prestamo}</p>
                <p><strong>Estado:</strong> ${prestamo.estado}</p>
            </div>
        `).join("");
    } catch (error) {
        console.error("Error al cargar préstamos:", error);
        alert("No se pudieron cargar los préstamos.");
    }
}
// Función para registrar un nuevo libro
document.getElementById("form-registrar-libro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo-libro").value;
    const autor = document.getElementById("autor-libro").value;
    const isbn = document.getElementById("isbn-libro").value;

    try {
        const response = await fetch(`${API_URL}/libros`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ titulo, autor, isbn }),
        });

        const resultado = await response.json();
        const mensajeDiv = document.getElementById("mensaje-registrar-libro");

        if (response.ok) {
            mensajeDiv.innerText = "Libro registrado exitosamente.";
        } else {
            mensajeDiv.innerText = resultado.error || "Error al registrar el libro.";
        }
    } catch (error) {
        console.error("Error al registrar libro:", error);
        alert("No se pudo registrar el libro.");
    }
});

// Verificar disponibilidad del libro en reservas
document.getElementById("form-reserva").addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuarioId = document.getElementById("reserva-usuario-id").value;
    const libroId = document.getElementById("reserva-libro-id").value;
    const fechaReserva = document.getElementById("fecha-reserva").value;

    try {
        const responseLibro = await fetch(`${API_URL}/libros/${libroId}`);
        const libro = await responseLibro.json();

        if (!libro.disponibilidad) {
            alert("El libro ya está reservado o prestado.");
            return;
        }

        const responseReserva = await fetch(`${API_URL}/reservas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario_id: usuarioId, libro_id: libroId, fecha_reserva: fechaReserva }),
        });

        const resultado = await responseReserva.json();
        if (responseReserva.ok) {
            alert(resultado.mensaje);
        } else {
            alert(resultado.error || "Error al realizar la reserva.");
        }
    } catch (error) {
        console.error("Error al reservar libro:", error);
        alert("No se pudo realizar la reserva.");
    }
});

// Verificar disponibilidad del libro en préstamos
document.getElementById("form-prestamo").addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuarioId = document.getElementById("usuario-id").value; // Corrección del ID
    const libroId = document.getElementById("libro-id").value;     // Corrección del ID
    const fechaPrestamo = document.getElementById("fecha-prestamo").value;

    try {
        const responseLibro = await fetch(`${API_URL}/libros/${libroId}`);
        const libro = await responseLibro.json();

        if (!libro.disponibilidad) {
            alert("El libro ya está reservado o prestado.");
            return;
        }

        const responsePrestamo = await fetch(`${API_URL}/prestamos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario_id: usuarioId, libro_id: libroId, fecha_prestamo: fechaPrestamo }),
        });

        const resultado = await responsePrestamo.json();
        if (responsePrestamo.ok) {
            alert(resultado.mensaje);
        } else {
            alert(resultado.error || "Error al registrar el préstamo.");
        }
    } catch (error) {
        console.error("Error al registrar préstamo:", error);
        alert("No se pudo registrar el préstamo.");
    }
});

// Función para registrar un nuevo usuario
document.getElementById("form-registro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("registro-nombre").value;
    const correo = document.getElementById("registro-correo").value;
    const contrasena = document.getElementById("registro-contrasena").value;

    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, correo, contrasena }),
        });

        const resultado = await response.json();
        const mensajeDiv = document.getElementById("registro-mensaje");

        if (response.ok) {
            mensajeDiv.innerText = "Registro exitoso. Ahora puedes iniciar sesión.";
        } else {
            mensajeDiv.innerText = resultado.error || "Error al registrar usuario.";
        }
    } catch (error) {
        console.error("Error en el registro:", error);
        alert("No se pudo completar el registro.");
    }
});