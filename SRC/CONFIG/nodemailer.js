const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Crear transporter con configuración más robusta
const transporte = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
    secure: (process.env.EMAIL_SECURE || "false").toLowerCase() === "true", // true para 465, false para otros puertos
    auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASS || ""
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verificar la conexión
transporte.verify(function(error, success) {
    if (error) {
        console.error("Error en la configuración de email:", error);
    } else {
        console.log("Servidor de email listo para enviar mensajes");
    }
});

async function enviarCodigo(email, codigo) {
    try {
        console.log("Intentando enviar email a:", email);
        console.log("Código a enviar:", codigo);
        const fromAddress = process.env.EMAIL_USER ? `"BIBLIOTECABG" <${process.env.EMAIL_USER}>` : '"BIBLIOTECABG" <no-reply@example.com>';

        const info = await transporte.sendMail({
            from: fromAddress,
            to: email,
            subject: "Código para recuperar contraseña",
            text: `Tu código de recuperación es: ${codigo}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Recuperación de Contraseña</h2>
                    <p>Has solicitado recuperar tu contraseña en la Biblioteca Institucional BG.</p>
                    <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h3 style="color: #007bff; margin: 0;">Tu código de verificación es:</h3>
                        <h1 style="color: #333; font-size: 32px; margin: 10px 0;">${codigo}</h1>
                    </div>
                    <p>Este código expira en 15 minutos.</p>
                    <p>Si no solicitaste este código, puedes ignorar este email.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">Biblioteca Institucional BG</p>
                </div>
            `
        });
        
        console.log("Email enviado exitosamente:", info.messageId);
        console.log("Accepted:", info.accepted);
        console.log("Rejected:", info.rejected);
        console.log("Envelope:", info.envelope);
        console.log("Response:", info.response);
        console.log("URL de vista previa:", nodemailer.getTestMessageUrl(info));
        return true;
    } catch (error) {
        console.error("Error al enviar email:", error);
        console.error("Detalles del error:", error.message);
        throw error;
    }
}

module.exports = enviarCodigo;