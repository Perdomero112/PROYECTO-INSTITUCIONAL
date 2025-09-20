const express = require('express');
const router = express.Router();
const db = require("../../CONFIG/db");
const { sessionMiddleware, tipoUsuario } = require("../../MIDDLEWARE/sesion.middleware");



// Ruta para mostrar la lista de usuarios
router.get('/', sessionMiddleware, tipoUsuario, (req, res) => {
    console.log("Accediendo a la ruta de usuarios");
    console.log("Usuario de sesión:", req.session.user);
    
    const sql = "SELECT * FROM usuarios";
    console.log("Ejecutando consulta:", sql);
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener los usuarios:", err);
            res.status(500).json({ error: "Error al obtener los usuarios" });
            return;
        }
        
        console.log("Resultados de la consulta:", results);
        console.log("Número de usuarios encontrados:", results.length);
        
        res.render("usuarios", { 
            users: results,
            user: req.session.user 
        });
    });
});

module.exports = router;