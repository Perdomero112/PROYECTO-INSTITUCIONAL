const express = require('express');
const ruta = express.Router();
const db = require("../../CONFIG/db");
const bcrypt = require("bcrypt");

// Configurar middleware para parsear datos del formulario
ruta.use(express.urlencoded({ extended: true }));
ruta.use(express.json());


//ruta GET --renderizar ejs--
ruta.get('/registroUsuario', (req, res) => {
    res.render('registroUsuario');
});

//ruta POST 
ruta.post("/registroUsuario" , (req,res) =>{
    procesarUsuario(req,res);
});

async function procesarUsuario (req,res) {
    let formUsuario = req.body;
    
    //formulario en comun
    let tipoUsuario = formUsuario.tipo_usr;
    let numeroDocumento = formUsuario.num_documento;
    let nombreUsr = formUsuario.nombre;
    let telefonoUsr = formUsuario.telefono;
    let email = formUsuario.email;
    let password = formUsuario.password;

    //extra para estudiantes 
    let grado = formUsuario.grado || null;
    let curso = formUsuario.curso || null;

    //extra para admin 
    let tokenAdmin = formUsuario.codigo_admin || null;

    try{
        //encriptar contraseña
        const encriptar = await bcrypt.hash(password,10);

        // consola: mostrar valores recibidos
        console.log("=== VALORES PROCESADOS ===");
        console.log("Tipo de usuario:", tipoUsuario);
        console.log("Número de documento:", numeroDocumento);
        console.log("Nombre:", nombreUsr);
        console.log("Teléfono:", telefonoUsr);
        console.log("Email:", email);
        console.log("Grado:", grado);
        console.log("Curso:", curso);
        console.log("Token admin:", tokenAdmin);

        //insertar datos de la tabla usuarios (todos los tipos de usuario)
        const consultaInsertUsr = `INSERT INTO usuarios (docum_usr,nombre_usr,grado_std,curso_std,telefono_usr,gmail_usr,password_usr,rol)
                                VALUES (?,?,?,?,?,?,?,?)`;
        
        // Verificar si el email ya existe en la tabla usuarios
        const verificarEmail = "SELECT gmail_usr as email FROM usuarios WHERE gmail_usr = ?";
        
        const tokenRequerido = "77456";

        // Primero verificar si el email ya existe
        console.log("Verificando si el email existe:", email);
        db.query(verificarEmail, [email], (err, result) => {
            if (err) {
                console.log("Error al verificar email:", err);
                return res.status(500).send("Error interno del servidor");
            }

            console.log("Resultado de verificación:", result);

            if (result.length > 0) {
                console.log("Este correo ya existe:", email);
                return res.status(400).send("El email ya está registrado en el sistema");
            }

            console.log("Email no existe, procediendo con el registro...");

            // Si el email no existe, proceder con el registro
            if(tipoUsuario === 'estudiante' || tipoUsuario === 'docente'){
                console.log("Registrando estudiante/docente...");
                db.query(consultaInsertUsr, [numeroDocumento,nombreUsr,grado,curso,telefonoUsr,email,encriptar,tipoUsuario], (err, resul) => {
                    if(err){
                        console.log(`Ha ocurrido un error: ${err}`);
                        return res.status(500).send("Error al registrar usuario");
                    }else{
                        console.log("Se ha registrado exitosamente el usuario con el rol " + tipoUsuario);
                        res.redirect("/");
                    }
                });
            //registro admin a la  DB
            }else if(tipoUsuario ==='admin'){
                console.log("Procesando registro de administrador...");
                if(tokenAdmin !== tokenRequerido){
                    console.log("Código ingresado es incorrecto");
                    return res.status(400).send("Código de administrador incorrecto");
                }else{
                    console.log("Código correcto, insertando administrador en tabla usuarios...");
                    db.query(consultaInsertUsr, [numeroDocumento,nombreUsr,grado,curso,telefonoUsr,email,encriptar,tipoUsuario], (err2,resul2)=>{
                        if(err2){
                            console.log("Error al registrar el administrador", err2);
                            return res.status(500).send("Error al registrar administrador");
                        }else{
                            console.log("Admin registrado exitosamente en tabla usuarios");
                            res.redirect("/");
                        }
                    });
                }
            } else {
                console.log("Tipo de usuario no reconocido:", tipoUsuario);
                return res.status(400).send("Tipo de usuario no válido");
            }
        });
    }catch(e){
        console.log("Hubo un error en el registro:", e);
        return res.status(500).send("Error interno del servidor durante el registro");
    }
}

module.exports = ruta;
