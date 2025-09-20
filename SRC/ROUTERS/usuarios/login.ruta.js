const express = require("express");
const ruta = express.Router();
const db = require("../../CONFIG/db");
const bcrypt = require("bcrypt");
const session = require("express-session");

ruta.get("/login" , (req,res) =>{
    res.render("login.ejs", {error: null});
});

ruta.post("/login" , (req,res)=>{
    const datosLogin = req.body;

    let email = datosLogin.email;
    let password = datosLogin.password;
    
    console.log("=== DATOS OBTENIDOS")
    console.log(email)
    console.log(password);
    
    // Corregido: gmai_usr por gmail_usr
    const sqlValidar = "SELECT * FROM usuarios WHERE gmail_usr = ?";
    db.query(sqlValidar, [email], async (err, results) => {
        if (err) {
            console.log("Error en la consulta:", err);
            return res.status(500).send("Error en la base de datos");
        }
        
        if (results.length > 0) {
            // Verificar la contraseña encriptada
            const usuario = results[0];
            try {
                const passwordValida = await bcrypt.compare(password, usuario.password_usr);
                
                
                if (passwordValida) {
                    // Usuario autenticado correctamente
                    console.log("Usuario autenticado:", usuario.nombre_usr);
                    //guardar en session
                    req.session.user = { 
                        id: usuario.id_usr, 
                        email: usuario.gmail_usr, 
                        nombre: usuario.nombre_usr, 
                        rol: usuario.rol,
                        num_documento: usuario.docum_usr,
                        grado: usuario.grado_std,
                        curso: usuario.curso_std
                    };
                    //redirigir a la pagina al usuario 
                    console.log("Sesión iniciada para:", req.session.user);
                    // Redirigir a la URL original o a la página principal
                    const redirigir = req.session.returnTo || '/';
                    res.redirect(redirigir);
                    
                } else {
                    // Contraseña incorrecta
                    console.log("Contraseña incorrecta para:", email);
                    res.render("login.ejs", { error: "Email o contraseña incorrectos" });
                }
                
            } catch (bcryptError) {
                console.log("Error al verificar contraseña:", bcryptError);
                return res.status(500).send("Error en la verificación de credenciales");
            }
        } else {
            // Usuario no encontrado
            console.log("Usuario no encontrado:", email);
            res.render("login.ejs", { error: "Email o contraseña incorrectos" });
        }
    });
})

// Ruta para cerrar sesión
ruta.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("Error al cerrar sesión:", err);
            return res.status(500).send("Error al cerrar sesión");
        }
        res.redirect('/login');
    });
});

module.exports = ruta;