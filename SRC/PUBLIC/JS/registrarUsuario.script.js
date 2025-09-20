
const tipoUsuario = document.querySelectorAll('input[name="tipo_usr"]');
const unico = document.querySelectorAll('.unico');
const estudiante = document.querySelector('.contenedor-estudiante');
const admin = document.querySelector('.contenedor-admin');

// Ocultar todos los campos específicos al cargar la página
function ocultarTodos() {
    estudiante.style.display = "none";
    estudiante.style.display = "disabled";
    admin.style.display = "none";
}

// Mostrar campos según el tipo de usuario seleccionado
function mostrarCampos(tipoUsuario) {
    ocultarTodos();
    
    if (tipoUsuario === "estudiante") {
        estudiante.style.display = "block";
    } else if (tipoUsuario === "admin") {
        admin.style.display = "block";
    }
    // Para docente no hay campos adicionales, se mantienen ocultos
}

// Agregar event listener a cada radio button
tipoUsuario.forEach(tipoUsuario => {
    tipoUsuario.addEventListener('change', (e) => {
        mostrarCampos(e.target.value);
    });
});


