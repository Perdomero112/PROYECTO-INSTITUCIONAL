const express = require("express");
const app = express()
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");


app.use(session({
    secret: process.env.SESSION_SECRET || 'mi_secreto',
    resave: false,
    saveUninitialized: true
}));



//configuración VIEWS
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "VIEWS"));

//CONFIGURACIÓN 
app.use(express.static(path.join(__dirname,"PUBLIC")));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//RUTAS
app.use(require("./ROUTERS/index.ruta.js"));//index
app.use(require("./ROUTERS/libros/registroLibros.ruta.js"));//registro de libros
app.use(require("./ROUTERS/libros/editarLibro.ruta.js"));// editar libro
app.use(require("./ROUTERS/libros/eliminarLibro.ruta.js"));// eliminar libros
app.use(require("./ROUTERS/libros/buscarLibro.ruta.js")); // search
app.use(require("./ROUTERS/usuarios/registrarUsuario.ruta.js")); // registrar usuario
app.use(require("./ROUTERS/usuarios/recuperarPassword.ruta.js"))// recuperar contraseña
app.use(require("./ROUTERS/usuarios/login.ruta.js"));
app.use(require("./ROUTERS/libros/infoLibro.ruta.js"));// info libro}
app.use(require("./ROUTERS/prestamo.ruta.js"));//prestamo
app.use(require("./ROUTERS/libros/catalogoLibro.ruta.js"));// catalogo de libros
app.use("/usuarios", require("./ROUTERS/usuarios/usuarios.ruta.js"));//usuarios



//SERVIDOR
app.listen(PORT, ()=>{
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    
})
