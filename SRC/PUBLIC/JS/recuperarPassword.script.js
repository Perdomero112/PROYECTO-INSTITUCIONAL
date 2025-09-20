document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de recuperación de contraseña cargado');
    
    // Elementos del DOM
    const formEmail = document.getElementById('formEmail');
    const formCodigo = document.getElementById('formCodigo');
    const formPassword = document.getElementById('formPassword');
    const messageContainer = document.getElementById('messageContainer');
    
    // Verificar que los elementos existan
    if (!formEmail || !formCodigo || !formPassword || !messageContainer) {
        console.error('Error: No se encontraron todos los elementos necesarios');
        return;
    }
    
    let userEmail = '';
    let currentStep = 1;

    // Función para mostrar mensajes
    function showMessage(message, type = 'info') {
        console.log(`Mostrando mensaje: ${message} (${type})`);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        messageContainer.innerHTML = '';
        messageContainer.appendChild(messageDiv);
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Función para cambiar de paso
    function goToStep(step) {
        console.log(`Cambiando al paso ${step}`);
        
        // Ocultar todos los formularios
        formEmail.classList.add('hidden');
        formCodigo.classList.add('hidden');
        formPassword.classList.add('hidden');
        
        // Remover clase active de todos
        formEmail.classList.remove('active');
        formCodigo.classList.remove('active');
        formPassword.classList.remove('active');
        
        // Mostrar el formulario correspondiente
        switch(step) {
            case 1:
                formEmail.classList.remove('hidden');
                formEmail.classList.add('active');
                break;
            case 2:
                formCodigo.classList.remove('hidden');
                formCodigo.classList.add('active');
                break;
            case 3:
                formPassword.classList.remove('hidden');
                formPassword.classList.add('active');
                break;
            default:
                console.error('Paso no válido:', step);
                return;
        }
        currentStep = step;
    }

    // Formulario 1: Validar Email
    formEmail.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Enviando formulario de email');
        
        const emailInput = document.getElementById('email');
        if (!emailInput) {
            showMessage('Error: Campo de email no encontrado', 'error');
            return;
        }
        
        const email = emailInput.value.trim();
        
        if (!email) {
            showMessage('Por favor ingresa tu email', 'error');
            return;
        }

        try {
            console.log('Enviando petición a /validarEmail');
            const response = await fetch('/validarEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email
                })
            });

            console.log('Respuesta recibida:', response.status);

            if (response.ok) {
                userEmail = email;
                
                // Guardar email en los campos hidden
                const emailHidden = document.getElementById('emailHidden');
                const emailHidden2 = document.getElementById('emailHidden2');
                
                if (emailHidden) emailHidden.value = email;
                if (emailHidden2) emailHidden2.value = email;
                
                showMessage('Email validado correctamente. Código enviado.', 'success');
                goToStep(2);
            } else {
                const errorText = await response.text();
                showMessage(errorText || 'Error al validar el email', 'error');
            }
        } catch (error) {
            console.error('Error en validación de email:', error);
            showMessage('Error de conexión', 'error');
        }
    });

    // Formulario 2: Validar Código
    formCodigo.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Enviando formulario de código');
        
        const codigoInput = document.getElementById('cod');
        if (!codigoInput) {
            showMessage('Error: Campo de código no encontrado', 'error');
            return;
        }
        
        const codigo = codigoInput.value.trim();
        
        if (!codigo) {
            showMessage('Por favor ingresa el código de verificación', 'error');
            return;
        }

        try {
            console.log('Enviando petición a /validarPassword');
            const response = await fetch('/validarPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cod: codigo,
                    email: userEmail
                })
            });

            console.log('Respuesta recibida:', response.status);

            if (response.ok) {
                showMessage('Código verificado correctamente', 'success');
                goToStep(3);
            } else {
                const errorText = await response.text();
                showMessage(errorText || 'Código incorrecto', 'error');
            }
        } catch (error) {
            console.error('Error en validación de código:', error);
            showMessage('Error de conexión', 'error');
        }
    });

    // Formulario 3: Cambiar Contraseña
    formPassword.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Enviando formulario de contraseña');
        
        const nuevaPasswordInput = document.getElementById('nuevaPassword');
        const confirmarPasswordInput = document.getElementById('confirmarPassword');
        
        if (!nuevaPasswordInput || !confirmarPasswordInput) {
            showMessage('Error: Campos de contraseña no encontrados', 'error');
            return;
        }
        
        const nuevaPassword = nuevaPasswordInput.value;
        const confirmarPassword = confirmarPasswordInput.value;
        
        if (!nuevaPassword || !confirmarPassword) {
            showMessage('Por favor completa todos los campos', 'error');
            return;
        }

        if (nuevaPassword !== confirmarPassword) {
            showMessage('Las contraseñas no coinciden', 'error');
            return;
        }

        if (nuevaPassword.length < 6) {
            showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            console.log('Enviando petición a /cambiarPassword');
            const response = await fetch('/cambiarPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nuevaPassword: nuevaPassword,
                    email: userEmail
                })
            });

            console.log('Respuesta recibida:', response.status);

            if (response.ok) {
                showMessage('Contraseña cambiada exitosamente.', 'success');
                
                // Redirigir después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                const errorText = await response.text();
                showMessage(errorText || 'Error al cambiar la contraseña', 'error');
            }
        } catch (error) {
            console.error('Error en cambio de contraseña:', error);
            showMessage('Error de conexión', 'error');
        }
    });

    // Validación en tiempo real para el código (solo números)
    const codigoInput = document.getElementById('cod');
    if (codigoInput) {
        codigoInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    // Validación en tiempo real para las contraseñas
    const confirmarPasswordInput = document.getElementById('confirmarPassword');
    if (confirmarPasswordInput) {
        confirmarPasswordInput.addEventListener('input', function() {
            const nuevaPassword = document.getElementById('nuevaPassword')?.value || '';
            const confirmarPassword = this.value;
            
            if (confirmarPassword && nuevaPassword !== confirmarPassword) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#28a745';
            }
        });
    }

    console.log('Script inicializado correctamente');
});
