// Biblioteca Institucional - JavaScript Base
// Funciones comunes para todas las páginas

(function init() {
    const run = () => {
        relocateProfileModalToBody();
        setupProfileModal();
        setupMobileMenu();
        setupSelectNavigation();
        setupNotifications();
        setupAnimations();
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        run();
    }
})();

// Modal de perfil
function setupProfileModal() {
    const modal = document.getElementById('modalPerfil');
    const closeBtn = document.getElementById('closeBtn');
    const bind = () => {
        const triggers = Array.from(document.querySelectorAll('#btnPerfil, #btnPerfilMobile'));
        if (!modal || !triggers.length) return false;
        try { console.debug('[perfil] binding triggers', triggers.map(t => t.id)); } catch {}
        triggers.forEach(btn => {
            if (btn.__perfilBound) return;
            btn.__perfilBound = true;
            try { btn.type = 'button'; } catch {}
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Evitar que el clic en perfil afecte al menú móvil
                if (typeof e.stopImmediatePropagation === 'function') {
                    e.stopImmediatePropagation();
                }
                e.stopPropagation();
                try { console.debug('[perfil] open modal from', btn.id); } catch {}
                openModal(modal);
            });
        });
        if (closeBtn && !closeBtn.__perfilBound) {
            closeBtn.__perfilBound = true;
            closeBtn.addEventListener('click', () => closeModal(modal));
        }
        if (!modal.__perfilBound) {
            modal.__perfilBound = true;
            modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(modal); });
        }
        return true;
    };

    // Intento inmediato y reintentos cortos por si el botón móvil se inyecta luego
    if (!bind()) {
        let attempts = 0;
        const iv = setInterval(() => {
            attempts++;
            if (bind() || attempts > 10) clearInterval(iv);
        }, 100);
    }

}

function openModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Menú móvil
function setupMobileMenu() {
    const menus = document.querySelectorAll('.menu-movil');
    if (!menus.length) return;

    menus.forEach((menuContainer, idx) => {
        const menuContent = menuContainer.querySelector('.menu-content');
        // 1) Preferir botón explícito si existe
        let menuBtn = menuContainer.querySelector('#btnMenuMobile');
        // 2) Fallback: identificar por el ícono del menú
        if (!menuBtn) {
            const menuIconImg = menuContainer.querySelector('button img[alt*="menu-img"], button img[src*="menu_icon"]');
            menuBtn = menuIconImg ? menuIconImg.closest('button') : null;
        }

        if (!menuBtn) return;
        try { menuBtn.type = 'button'; } catch {}

        // Debug ligero (no intrusivo)
        try { console.debug('[menu-movil] init', { index: idx }); } catch {}

        let lastToggleTs = 0;
        let lastOpenTs = 0;
        let overlayEl = null;
        let placeholder = null; // para portal de menú
        const toggleMenu = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            const now = Date.now();
            if (now - lastToggleTs < 200) return; // evitar doble disparo por touch+click
            lastToggleTs = now;
            menuContainer.classList.toggle('active');

            const icon = menuBtn.querySelector('img');
            if (icon) {
                icon.style.transform = menuContainer.classList.contains('active')
                    ? 'rotate(90deg)'
                    : 'rotate(0deg)';
            }
            // Refuerzo visual: controlar display explícitamente por si algún CSS lo sobrescribe
            if (menuContent) {
                if (menuContainer.classList.contains('active')) {
                    // Portal: mover el dropdown al body para evitar clipping
                    if (!placeholder) {
                        placeholder = document.createElement('span');
                        placeholder.style.display = 'none';
                        menuContainer.insertBefore(placeholder, menuContent);
                    }
                    if (menuContent.parentNode !== document.body) {
                        document.body.appendChild(menuContent);
                    }
                    // Overlay para cerrar al tocar fuera
                    if (!overlayEl) {
                        overlayEl = document.createElement('div');
                        overlayEl.id = 'menu-overlay';
                        overlayEl.style.position = 'fixed';
                        overlayEl.style.inset = '0';
                        overlayEl.style.background = 'transparent';
                        overlayEl.style.zIndex = '9998';
                        overlayEl.addEventListener('click', () => {
                            // cerrar
                            menuContainer.classList.remove('active');
                            if (menuContent) {
                                menuContent.style.display = 'none';
                                menuContent.style.visibility = 'hidden';
                                menuContent.style.opacity = '0';
                                menuContent.style.pointerEvents = 'none';
                            }
                            if (overlayEl && overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
                            overlayEl = null;
                            // restaurar menú a su contenedor original
                            if (placeholder && placeholder.parentNode && menuContent.parentNode === document.body) {
                                placeholder.parentNode.insertBefore(menuContent, placeholder);
                            }
                        });
                    }
                    if (!document.getElementById('menu-overlay')) {
                        document.body.appendChild(overlayEl);
                    }
                    // Forzar visibilidad y stacking (fixed) y posicionar relativo al botón
                    menuContent.style.display = 'flex';
                    menuContent.style.flexDirection = 'column';
                    menuContent.style.visibility = 'visible';
                    menuContent.style.opacity = '1';
                    menuContent.style.pointerEvents = 'auto';
                    menuContent.style.zIndex = '9999';
                    menuContent.style.position = 'fixed';
                    // Posicionar relativo al botón para evitar clipping por layout específico
                    const btnRect = menuBtn.getBoundingClientRect();
                    const topPx = Math.round(btnRect.bottom + 8);
                    // Posicionar por left para evitar problemas con contenedores flex/rtl
                    const estimatedWidth = 260; // cercano a minWidth
                    const leftCandidate = Math.round(btnRect.left);
                    const leftPx = Math.max(12, Math.min(leftCandidate, window.innerWidth - estimatedWidth - 12));
                    menuContent.style.top = topPx + 'px';
                    menuContent.style.left = leftPx + 'px';
                    menuContent.style.right = 'auto';
                    menuContent.style.maxWidth = '92vw';
                    menuContent.style.minWidth = '220px';
                    // Garantizar visibilidad vertical
                    const maxH = Math.max(180, window.innerHeight - topPx - 12);
                    menuContent.style.maxHeight = maxH + 'px';
                    menuContent.style.overflowY = 'auto';
                    lastOpenTs = now;
                } else {
                    // cerrar y limpiar overlay + restaurar portal
                    menuContent.style.display = 'none';
                    menuContent.style.visibility = 'hidden';
                    menuContent.style.opacity = '0';
                    menuContent.style.pointerEvents = 'none';
                    if (overlayEl && overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
                    overlayEl = null;
                    if (placeholder && placeholder.parentNode && menuContent.parentNode === document.body) {
                        placeholder.parentNode.insertBefore(menuContent, placeholder);
                    }
                }
            }
        };

        menuBtn.addEventListener('click', toggleMenu);
        menuBtn.addEventListener('touchend', toggleMenu, { passive: false });

        if (menuContent) {
            // Evitar que clics dentro del menú cierren inmediatamente por el listener global
            if (!menuContent.__menuBound) {
                menuContent.__menuBound = true;
                menuContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
            menuContent.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    menuContainer.classList.remove('active');
                    // Ocultar explícitamente al cerrar por navegación
                    menuContent.style.display = 'none';
                    if (overlayEl && overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
                    overlayEl = null;
                    // restaurar portal
                    if (placeholder && placeholder.parentNode && menuContent.parentNode === document.body) {
                        placeholder.parentNode.insertBefore(menuContent, placeholder);
                    }
                });
            });
        }

        // Cerrar al hacer clic fuera (uno por menú)
        document.addEventListener('click', (e) => {
            // Pequeño guard para no cerrar inmediatamente tras abrir por bubbling en móviles
            if (Date.now() - lastOpenTs < 200) return;
            // Si el menú fue movido al body, no cerrar cuando el target está dentro del menú
            if (menuContent && menuContent.parentNode === document.body && menuContent.contains(e.target)) return;
            if (!menuContainer.contains(e.target)) {
                menuContainer.classList.remove('active');
                if (menuContent) {
                    menuContent.style.display = 'none';
                    menuContent.style.visibility = 'hidden';
                    menuContent.style.opacity = '0';
                    menuContent.style.pointerEvents = 'none';
                }
                if (overlayEl && overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
                overlayEl = null;
                if (placeholder && placeholder.parentNode && menuContent && menuContent.parentNode === document.body) {
                    placeholder.parentNode.insertBefore(menuContent, placeholder);
                }
            }
        });
    });
}

// Mover el modal de perfil al <body> para evitar problemas de stacking/overflow en header/nav
function relocateProfileModalToBody() {
    const modal = document.getElementById('modalPerfil');
    if (modal && modal.parentElement !== document.body) {
        try {
            document.body.appendChild(modal);
        } catch (err) {
            console.error('No se pudo mover el modal al <body>:', err);
        }
    }
}

// Navegación de selects
function setupSelectNavigation() {
    const adminSelect = document.getElementById('opcionAdmin');
    const userSelect = document.getElementById('opcionUsuario');

    // Redirección para select de administración (admin)
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

function getPageName(url) {
    const pageNames = {
        '/registrarLibro': 'Registrar Libro',
        '/prestamos': 'Préstamos',
        '/usuarios': 'Usuarios',
        '/catalogoLibros': 'Catálogo',
        '/mis-prestamos': 'Mis Préstamos'
    };
    return pageNames[url] || 'la página seleccionada';
}

// Sistema de notificaciones
function setupNotifications() {
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




function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 400);
}

// Animaciones
function setupAnimations() {
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

    document.querySelectorAll('.libro-card, .hero-content, .section-header').forEach(el => {
        observer.observe(el);
    });

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

            .notification {
                backdrop-filter: blur(10px);
            }

            .notification:hover {
                transform: translateX(-5px) !important;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2) !important;
            }

            @keyframes slideUp {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

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

// Auto-hide alert messages
window.addEventListener('load', () => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        // Add click to dismiss
        alert.style.cursor = 'pointer';
        alert.addEventListener('click', () => {
            hideAlert(alert);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideAlert(alert);
        }, 5000);
    });
});

function hideAlert(alert) {
    alert.style.animation = 'slideUp 0.3s ease forwards';
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 300);
}

// Manejar errores globalmente
window.addEventListener('error', (e) => {
    console.error('Error:', e.error);
    showNotification('❌ Ocurrió un error inesperado', 'error');
});

// (Se eliminó la inyección automática del botón de perfil móvil; ahora es estático en index.ejs)
