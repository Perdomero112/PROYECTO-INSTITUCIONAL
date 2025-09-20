const db = require("../../CONFIG/db");
const express = require("express");
const ruta = express.Router();
const  { sessionMiddleware, tipoUsuario } = require("../../MIDDLEWARE/sesion.middleware");

// Ruta para buscar libros por nombre
ruta.get("/buscar",sessionMiddleware,tipoUsuario, (req, res) => {
    const terminoBusqueda = req.query.q; 
    
    console.log("BÚSQUEDA INICIADA");
    console.log("Término de búsqueda recibido:", terminoBusqueda);
    
    if (!terminoBusqueda || terminoBusqueda.trim() === "") {
        console.log("Búsqueda vacía, redirigiendo a página principal");
        return res.redirect("catalogoLibros");
    }
    
    // Limpiar el término de búsqueda
    const terminoLimpio = terminoBusqueda.trim();
    console.log("Término limpio:", terminoLimpio);
    
    // Consulta SQL para buscar en nombre, autor y categoría
    const consulta = "SELECT * FROM libros WHERE LOWER(nombre) LIKE LOWER(?) OR LOWER(autor) LIKE LOWER(?) OR LOWER(categoria) LIKE LOWER(?)";
    const busqueda = `%${terminoLimpio}%`;
    db.query(consulta, [busqueda, busqueda, busqueda], (err, libros) => {
        if (err) {
            console.log(" Error al buscar libros:", err);
            res.render("catalogoLibros", { libros: [], terminoBusqueda: terminoLimpio, user: req.session.user });
        } else {
            console.log("Libros encontrados: " + libros.length);
            res.render("catalogoLibros", { libros: libros || [], terminoBusqueda: terminoLimpio, user: req.session.user });
        }
        console.log("BÚSQUEDA FINALIZADA");
    });

    //usuario
    
});

module.exports = ruta;

