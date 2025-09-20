document.addEventListener('DOMContentLoaded', function() {
    // Modal de perfil
    const btnPerfil = document.getElementById('btnPerfil');
    const modalPerfil = document.getElementById('modalPerfil');
    const closeBtn = document.getElementById('closeBtn');

    if (btnPerfil && modalPerfil) {
        btnPerfil.addEventListener('click', function() {
            modalPerfil.classList.add('active');
        });
    }

    if (closeBtn && modalPerfil) {
        closeBtn.addEventListener('click', function() {
            modalPerfil.classList.remove('active');
        });
    }

    // Cerrar modal al hacer clic fuera
    if (modalPerfil) {
        modalPerfil.addEventListener('click', function(e) {
            if (e.target === modalPerfil) {
                modalPerfil.classList.remove('active');
            }
        });
    }

    // Select de administración
    const opcionAdmin = document.getElementById('opcionAdmin');
    if (opcionAdmin) {
        opcionAdmin.addEventListener('change', function() {
            if (this.value) {
                window.location.href = this.value;
            }
        });
    }

    // Menú móvil: se maneja globalmente en /JS/base.script.js

    // Confirmación para eliminar usuario
    const deleteLinks = document.querySelectorAll('a[href*="/usuarios/"] img[alt="eliminar"]');
    deleteLinks.forEach(img => {
        const link = img.parentElement;
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                window.location.href = this.href;
            }
        });
    });
});
