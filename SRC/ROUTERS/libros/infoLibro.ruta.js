const express = require('express');
const ruta = express.Router();
const db = require("../../CONFIG/db.js");

ruta.get("/infoLibro/:id", async(req, res) => {
    const libroId = req.params.id;
    const user = req.session.user; // Obtener el usuario de la sesión
    const sql = "SELECT * FROM libros WHERE id_libro = ?";
    try {
    db.query(sql, [libroId] , (err, results) => {
        if (err){
            console.error("error al obtener los datos del libro especifico", err);
            return res.status(500).send("Error el busqyeda del libro");
        }else{
            if (results.length === 0){
                return res.status(404).send("Libro no encontrado");
            }else{
                const libro = results[0];
                res.render("infoLibro.ejs", { libro, user }); // Pasar el usuario a la vista
            }
        }
    });
} catch (error) {
    console.error("Error en la consulta:", error);
    res.status(500).send("Error en el servidor");   
}
});

module.exports = ruta;
