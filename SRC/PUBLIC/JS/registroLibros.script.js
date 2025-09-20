// Funcionalidad específica para la página de registro de libros
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos del formulario
    const form = document.getElementById('registroForm');
    const submitBtn = document.getElementById('submitBtn');
    const fileInput = document.getElementById('imagen');
    const nombreInput = document.getElementById('nombre_libro');
    const autorInput = document.getElementById('autor');
    const cantidadInput = document.getElementById('cantidad');
    const categoriaInput = document.getElementById('categoria');

    // Validación en tiempo real
    function validateField(input, minLength = 2) {
        const value = input.value.trim();
        const isValid = value.length >= minLength;
        
        if (isValid) {
            input.style.borderColor = '#10b981';
            input.style.backgroundColor = '#f0fdf4';
        } else {
            input.style.borderColor = '#ef4444';
            input.style.backgroundColor = '#fef2f2';
        }
        
        return isValid;
    }

    // Validación de archivo
    function validateFile(file) {
        if (!file) return true; // Archivo opcional
        
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        
        if (file.size > maxSize) {
            if (typeof window.showNotification === 'function') {
                window.showNotification('El archivo es demasiado grande. Máximo 5MB.', 'error');
            }
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            if (typeof window.showNotification === 'function') {
                window.showNotification('Formato de archivo no válido. Use JPG, PNG o GIF.', 'error');
            }
            return false;
        }
        
        return true;
    }

    // Event listeners para validación en tiempo real
    nombreInput.addEventListener('input', () => validateField(nombreInput, 2));
    autorInput.addEventListener('input', () => validateField(autorInput, 2));
    categoriaInput.addEventListener('input', () => validateField(categoriaInput, 2));
    
    cantidadInput.addEventListener('input', () => {
        const value = parseInt(cantidadInput.value);
        const isValid = value >= 1 && value <= 1000;
        
        if (isValid) {
            cantidadInput.style.borderColor = '#10b981';
            cantidadInput.style.backgroundColor = '#f0fdf4';
        } else {
            cantidadInput.style.borderColor = '#ef4444';
            cantidadInput.style.backgroundColor = '#fef2f2';
        }
    });

    // Validación de archivo
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file && !validateFile(file)) {
            this.value = '';
        } else if (file) {
            if (typeof window.showNotification === 'function') {
                window.showNotification('Archivo seleccionado correctamente', 'success');
            }
        }
    });

    // Prevenir envío de formulario inválido
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar todos los campos
        const isNombreValid = validateField(nombreInput, 2);
        const isAutorValid = validateField(autorInput, 2);
        const isCategoriaValid = validateField(categoriaInput, 2);
        const isCantidadValid = parseInt(cantidadInput.value) >= 1;
        const isFileValid = !fileInput.files[0] || validateFile(fileInput.files[0]);
        
        if (!isNombreValid || !isAutorValid || !isCategoriaValid || !isCantidadValid || !isFileValid) {
            if (typeof window.showNotification === 'function') {
                window.showNotification('Por favor, completa todos los campos correctamente', 'error');
            }
            return;
        }
        
        // Mostrar estado de carga
        submitBtn.disabled = true;
        submitBtn.value = 'Registrando...';
        submitBtn.style.opacity = '0.7';
        
        // Enviar formulario
        const formData = new FormData(form);
        
        fetch('/registro', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('¡Libro registrado exitosamente!', 'success');
                }
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                throw new Error('Error en el servidor');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (typeof window.showNotification === 'function') {
                window.showNotification('Error al registrar el libro. Inténtalo de nuevo.', 'error');
            }
            
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.value = 'Registrar Libro';
            submitBtn.style.opacity = '1';
        });
    });

    // Limpiar formulario
    function clearForm() {
        form.reset();
        // Restaurar estilos de campos
        [nombreInput, autorInput, categoriaInput, cantidadInput].forEach(input => {
            input.style.borderColor = '#e5e7eb';
            input.style.backgroundColor = '#f9fafb';
        });
    }

    // Agregar botón de limpiar (opcional)
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'Limpiar Formulario';
    clearBtn.style.cssText = `
        background: #6b7280;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        margin-left: 1rem;
        transition: all 0.3s ease;
    `;
    
    clearBtn.addEventListener('click', clearForm);
    clearBtn.addEventListener('mouseenter', () => {
        clearBtn.style.backgroundColor = '#4b5563';
    });
    clearBtn.addEventListener('mouseleave', () => {
        clearBtn.style.backgroundColor = '#6b7280';
    });
    
    // Agregar botón después del botón de envío
    submitBtn.parentNode.insertBefore(clearBtn, submitBtn.nextSibling);
});
