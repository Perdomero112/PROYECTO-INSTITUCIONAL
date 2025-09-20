const express = require("express");
const ruta = express.Router();
const crypto = require("crypto");
const db = require("../../CONFIG/db");
const bcrypt = require("bcrypt");
const enviarCodigo = require("../../CONFIG/nodemailer");

// Configurar middleware para parsear datos del formulario
ruta.use(express.urlencoded({ extended: true }));
ruta.use(express.json());

// Almacenar códigos de verificación temporalmente
const verificationCodes = new Map();

ruta.get("/recuperarPassword", (req, res) => {
    console.log("Accediendo a la ruta /recuperarPassword");
    res.render("recuperarPassword.ejs");
});

// Ruta para validar email
ruta.post("/validarEmail", async (req, res) => {
    try {
        console.log("Datos recibidos:", req.body);
        const emailObtenido = req.body.email;
        
        if (!emailObtenido) {
            return res.status(400).send("Email es requerido");
        }

        // Buscar en la tabla usuarios
        const consultaEmail = "SELECT gmail_usr as email FROM usuarios WHERE gmail_usr = ?";

        db.query(consultaEmail, [emailObtenido], async (err, result) => {
            if (err) {
                console.log("Error en la validación del email:", err);
                return res.status(500).send("Error interno del servidor");
            }

            if (result.length === 0) {
                console.log("Email no encontrado:", emailObtenido);
                return res.status(404).send("El email no está registrado en el sistema");
            }

            // Generar código de verificación
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Guardar el código temporalmente
            verificationCodes.set(emailObtenido, {
                code: codigo,
                timestamp: Date.now()
            });

            console.log("Email validado correctamente:", emailObtenido);
            console.log("Código de verificación generado:", codigo);
            
            // Enviar email con el código
            try {
                await enviarCodigo(emailObtenido, codigo);
                console.log("Email enviado exitosamente a:", emailObtenido);
                res.status(200).send("Email validado correctamente. Código enviado.");
            } catch (emailError) {
                console.error("Error al enviar email:", emailError);
                // Aún así enviamos respuesta exitosa para que el usuario pueda continuar
                res.status(200).send("Email validado correctamente. Código enviado.");
            }
        });
    } catch (error) {
        console.error("Error en validarEmail:", error);
        res.status(500).send("Error interno del servidor");
    }
});

// Ruta para validar código
ruta.post("/validarPassword", async (req, res) => {
    try {
        console.log("Datos recibidos en validarPassword:", req.body);
        const codigoObtenido = req.body.cod;
        const emailObtenido = req.body.email;

        if (!codigoObtenido || !emailObtenido) {
            return res.status(400).send("Código y email son requeridos");
        }

        const storedData = verificationCodes.get(emailObtenido);
        
        if (!storedData) {
            return res.status(400).send("No se encontró un código de verificación para este email");
        }

        // Verificar si el código ha expirado (15 minutos)
        const now = Date.now();
        const codeAge = now - storedData.timestamp;
        const fifteenMinutes = 15 * 60 * 1000;

        if (codeAge > fifteenMinutes) {
            verificationCodes.delete(emailObtenido);
            return res.status(400).send("El código de verificación ha expirado");
        }

        if (codigoObtenido !== storedData.code) {
            console.log("Código incorrecto:", codigoObtenido);
            return res.status(401).send("Código incorrecto");
        }

        console.log("Código verificado correctamente");
        
        // Marcar el código como verificado
        storedData.verified = true;
        verificationCodes.set(emailObtenido, storedData);

        res.status(200).send("Código verificado correctamente");
    } catch (error) {
        console.error("Error en validarPassword:", error);
        res.status(500).send("Error interno del servidor");
    }
});

// Ruta para cambiar contraseña
ruta.post("/cambiarPassword", async (req, res) => {
    try {
        console.log("Datos recibidos en cambiarPassword:", req.body);
        const passwordNueva = req.body.nuevaPassword;
        const emailObtenido = req.body.email;

        if (!passwordNueva || !emailObtenido) {
            return res.status(400).send("Contraseña y email son requeridos");
        }

        // Verificar que el código haya sido verificado
        const storedData = verificationCodes.get(emailObtenido);
        if (!storedData || !storedData.verified) {
            return res.status(400).send("Debe verificar el código primero");
        }

        // Encriptar la nueva contraseña
        const encriptar = await bcrypt.hash(passwordNueva, 10);

        // Actualizar en la tabla usuarios
        const sqlUpdateUsuarios = "UPDATE usuarios SET password_usr = ? WHERE gmail_usr = ?";
        
        // Actualizar la contraseña en la tabla usuarios
        db.query(sqlUpdateUsuarios, [encriptar, emailObtenido], (err, result) => {
            if (err) {
                console.log("Error al cambiar la contraseña:", err);
                return res.status(500).send("Error al cambiar la contraseña");
            }

            if (result.affectedRows > 0) {
                console.log("Contraseña actualizada exitosamente");
                verificationCodes.delete(emailObtenido);
                return res.status(200).send("Contraseña cambiada exitosamente");
            }

            return res.status(404).send("Usuario no encontrado");
        });
    } catch (error) {
        console.error("Error en cambiarPassword:", error);
        res.status(500).send("Error interno del servidor");
    }
});

module.exports = ruta;