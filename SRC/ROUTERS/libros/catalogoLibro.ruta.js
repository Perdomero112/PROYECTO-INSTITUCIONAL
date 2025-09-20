const express = require ("express");
const ruta = express.Router();
const db = require("../../CONFIG/db");
const { sessionMiddleware, tipoUsuario } = require("../../MIDDLEWARE/sesion.middleware");

ruta.get("/catalogoLibros", tipoUsuario, sessionMiddleware, (req, res) => {
    const sql = "SELECT * FROM libros";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener los libros:", err);
            return res.status(500).json({ error: "Error al obtener los libros" });
        }
        
        // Obtener mensajes de query params
        const success = req.query.success || null;
        const error = req.query.error || null;
        
        res.render("catalogoLibros", { 
            libros: results, 
            user: req.session.user,
            success: success,
            error: error
        });
    });
});

module.exports = ruta;
