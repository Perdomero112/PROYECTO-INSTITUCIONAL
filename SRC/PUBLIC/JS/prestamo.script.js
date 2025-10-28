// Funcionalidad específica para la página de préstamos
document.addEventListener('DOMContentLoaded', function() {
    
    // Configurar funcionalidad de búsqueda
    setupSearchFunctionality();
    
    // Configurar acciones de préstamos
    setupPrestamoActions();
    
    // Verificar préstamos en mora
    checkMoraStatus();
    
});

// Funcionalidad de búsqueda
function setupSearchFunctionality() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.getElementById('buscador');
    const filterSelect = document.getElementById('opcion-busqueda');
    const searchBtn = document.getElementById('btn-buscar');

    if (searchForm) {
        // Envío del formulario
        searchForm.addEventListener('submit', (e) => {
            const searchTerm = searchInput.value.trim();
            const filterValue = filterSelect.value;
            
            // Si no hay término de búsqueda ni filtro, prevenir envío
            if (!searchTerm && !filterValue) {
                e.preventDefault();
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Ingresa un término de búsqueda o selecciona un filtro', 'warning');
                }
                return;
            }
            
            // Mostrar indicador de carga
            if (searchBtn) {
                const originalText = searchBtn.innerHTML;
                searchBtn.innerHTML = '<span class="btn-text">Buscando...</span><span class="btn-icon">⏳</span>';
                searchBtn.disabled = true;
                
                // Restaurar después de un tiempo (en caso de error)
                setTimeout(() => {
                    searchBtn.innerHTML = originalText;
                    searchBtn.disabled = false;
                }, 5000);
            }
        });

        // Búsqueda en tiempo real con debounce
        let searchTimeout;
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const value = e.target.value.trim();
                    if (value.length >= 3) {
                        // Aquí podrías implementar búsqueda en tiempo real
                        console.log('Búsqueda en tiempo real:', value);
                    }
                }, 500);
            });
        }

        // Cambio en filtro automático
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                const filterValue = e.target.value;
                if (filterValue) {
                    // Auto-enviar formulario cuando se selecciona un filtro
                    const searchTerm = searchInput ? searchInput.value.trim() : '';
                    
                    // Construir URL con parámetros
                    const params = new URLSearchParams();
                    if (searchTerm) params.append('q', searchTerm);
                    if (filterValue) params.append('opcion-busqueda', filterValue);
                    
                    window.location.href = `/buscarPrestamo?${params.toString()}`;
                }
            });
        }
    }

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K para enfocar búsqueda
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });
}


// Utilidades específicas para préstamos
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

// Configurar acciones de préstamos con modales personalizados
function setupPrestamoActions() {
    // Configurar todos los botones de acción
    const actionButtons = document.querySelectorAll('[data-action]');
    
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const action = this.getAttribute('data-action');
            const prestamoId = this.getAttribute('data-prestamo-id');
            const libroNombre = this.getAttribute('data-libro-nombre');
            const form = this.closest('form');
            
            showCustomModal(action, libroNombre, () => {
                // Callback cuando se confirma la acción
                const messages = {
                    'aceptar': '✅ Procesando aceptación de préstamo...',
                    'devolver': '📚 Procesando devolución...',
                    'eliminar': '🗑️ Eliminando préstamo...'
                };
                
                // Usar la función showNotification del base script
                if (typeof window.showNotification === 'function') {
                    window.showNotification(messages[action], action === 'eliminar' ? 'warning' : 'info');
                }
                
                setTimeout(() => {
                    // Copiar observación del modal al input oculto antes de enviar
                    const obsField = form.querySelector('input[name="observacion"]');
                    const modalObs = document.getElementById('modalObservacion');
                    if (obsField && modalObs) {
                        obsField.value = modalObs.value.trim();
                    }
                    // Enviar el formulario directamente
                    form.submit();
                }, 800);
            });
        });
    });
}

// Mostrar modal personalizado
function showCustomModal(action, libroNombre, onConfirm) {
    const modal = document.getElementById('modalConfirmacion');
    const icon = document.getElementById('modalIcon');
    const title = document.getElementById('modalTitle');
    const message = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('btnConfirmar');
    const cancelBtn = document.getElementById('btnCancelar');
    
    // Configurar contenido según la acción
    const config = {
        'aceptar': {
            icon: '✅',
            title: 'Aceptar Préstamo',
            message: `¿Confirmas la aceptación del préstamo del libro "${libroNombre}"?`,
            confirmText: 'Aceptar Préstamo',
            confirmColor: '#10b981'
        },
        'devolver': {
            icon: '📚',
            title: 'Devolver Libro',
            message: `¿Confirmas la devolución del libro "${libroNombre}"?`,
            confirmText: 'Confirmar Devolución',
            confirmColor: '#3b82f6'
        },
        'eliminar': {
            icon: '🗑️',
            title: 'Eliminar Préstamo',
            message: `¿Estás seguro de eliminar el préstamo del libro "${libroNombre}"? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar Préstamo',
            confirmColor: '#ef4444'
        }
    };
    
    const actionConfig = config[action];
    
    icon.textContent = actionConfig.icon;
    title.textContent = actionConfig.title;
    message.textContent = actionConfig.message;
    confirmBtn.textContent = actionConfig.confirmText;
    confirmBtn.style.backgroundColor = actionConfig.confirmColor;
    
    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Configurar eventos
    const handleConfirm = () => {
        hideCustomModal();
        onConfirm();
        cleanup();
    };
    
    const handleCancel = () => {
        hideCustomModal();
        cleanup();
    };
    
    const handleClickOutside = (e) => {
        if (e.target === modal) {
            hideCustomModal();
            cleanup();
        }
    };
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            hideCustomModal();
            cleanup();
        }
    };
    
    const cleanup = () => {
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        modal.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    modal.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
}

// Ocultar modal personalizado
function hideCustomModal() {
    const modal = document.getElementById('modalConfirmacion');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Verificar préstamos en mora
function checkMoraStatus() {
    const moraRows = document.querySelectorAll('tr[data-mora="true"], .prestamo-row[data-mora="true"]');
    if (moraRows.length > 0) {
        setTimeout(() => {
            if (typeof window.showNotification === 'function') {
                window.showNotification(`⚠️ Hay ${moraRows.length} préstamo(s) en mora`, 'warning');
            }
        }, 2000);
    }
}
