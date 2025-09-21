// Inicialización específica para catálogo
document.addEventListener('DOMContentLoaded', function() {
    setupDeleteModals();
    setupBookOperations();
});

// Configurar modales de eliminación
function setupDeleteModals() {
    const deleteButtons = document.querySelectorAll('.btn-eliminar-trigger');
    
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const libroCard = btn.closest('.libro-card');
            const modal = libroCard.querySelector('.modal-eliminar_libro');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }

        });
    });

    // Cerrar modales de eliminación
    const closeButtons = document.querySelectorAll('.close-btn-eliminar');
    const cancelButtons = document.querySelectorAll('.btn-cancelar');
    
    [...closeButtons, ...cancelButtons].forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = btn.closest('.modal-eliminar_libro');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });

    // Cerrar modal al hacer clic fuera
    const deleteModals = document.querySelectorAll('.modal-eliminar_libro');
    deleteModals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
}

// Configurar operaciones de libros
function setupBookOperations() {
    // Interceptar formularios de eliminación
    const deleteforms = document.querySelectorAll('.modal-eliminar_libro form');
    deleteforms.forEach(form => {
        form.addEventListener('submit', (e) => {
            showNotification('🗑️ Eliminando libro...', 'warning');
        });
    });

    // Notificaciones para edición
    const editButtons = document.querySelectorAll('.btn-editar');
    editButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            showNotification('✏️ Abriendo editor de libro...', 'info');
        });
    });
}

// (El manejo del modal de perfil y del menú móvil lo hace /JS/base.script.js)

// Navegación de selects
function setupSelectNavigation() {
    const adminSelect = document.getElementById('opcionAdmin');
    const userSelect = document.getElementById('opcionUsuario');

    if (adminSelect) {
        adminSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value) {
                window.location.href = value;
            }
        });
    }

    if (userSelect) {
        userSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value) {
                window.location.href = value;
            }
        });
    }
}

// Obtener nombre de página amigable
function getPageName(url) {
    const pageNames = {
        '/registarLibro': 'Registrar Libro',
        '/prestamos': 'Préstamos',
        '/usuarios': 'Usuarios',
        '/libros': 'Libros',
        '/mis-prestamos': 'Mis Préstamos',
        '/favoritos': 'Favoritos',
        '/catalogoLibros': 'Catálogo'
    };
    return pageNames[url] || 'la página seleccionada';
}

// Sistema de notificaciones
function setupNotifications() {
    // Crear contenedor de notificaciones si no existe
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
}

// Mostrar notificaciones bonitas
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: { bg: '#10b981', icon: '✅' },
        error: { bg: '#ef4444', icon: '❌' },
        warning: { bg: '#f59e0b', icon: '⚠️' },
        info: { bg: '#3b82f6', icon: 'ℹ️' }
    };

    const color = colors[type] || colors.info;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.2rem;">${color.icon}</span>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        background: ${color.bg};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        margin-bottom: 0.5rem;
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        pointer-events: auto;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.9rem;
        max-width: 350px;
        word-wrap: break-word;
    `;

    container.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Cerrar al hacer clic
    notification.addEventListener('click', () => {
        removeNotification(notification);
    });

    // Auto-remover después de 4 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            removeNotification(notification);
        }
    }, 4000);
}

// Remover notificación
function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 400);
}

// Configurar animaciones
function setupAnimations() {
    // Observador de intersección para animaciones
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observar elementos que necesitan animación
    document.querySelectorAll('.libro-card, .hero-content, .section-header').forEach(el => {
        observer.observe(el);
    });

    // Añadir estilos de animación
    if (!document.getElementById('animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            .animate-in {
                animation: slideInUp 0.6s ease forwards;
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .hero-content {
                animation: fadeInScale 1s ease forwards;
            }

            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .menu-movil button img {
                transition: transform 0.3s ease;
            }

            .notification {
                backdrop-filter: blur(10px);
            }

            .notification:hover {
                transform: translateX(-5px) !important;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Mensaje de bienvenida
window.addEventListener('load', () => {
    setTimeout(() => {
        showNotification('🎉 ¡Bienvenido a la Biblioteca Institucional!', 'success');
    }, 1000);
});

// Manejar errores globalmente
window.addEventListener('error', (e) => {
    console.error('Error:', e.error);
    showNotification('❌ Ocurrió un error inesperado', 'error');
});

// Funciones de utilidad
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

