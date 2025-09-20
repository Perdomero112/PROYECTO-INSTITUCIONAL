const express = require('express');
const ruta = express.Router();
const db = require('../../CONFIG/db');
const upload = require("../../MIDDLEWARE/multerConfig");
const fs = require("fs");
const path = require("path");

// GET - Mostrar formulario de edición
ruta.get('/editar/:id' , (req,res)=>{
    let id = req.params.id;
    console.log("Accediendo a la ruta /editar del id " + id)
    db.query("SELECT * FROM libros WHERE id_libro = ?", [id], (err, result) => {
        if (err){
            console.log("Error en la consulta de edición, error:" + err);
            return res.status(500).send("Error al obtener el libro " + id)
        }if (result.length === 0){
            return res.status(404).send("Libro no encontrado o no existe")
        }else{
            console.log("Libro encontrado: ");
            // Pasar usuario en sesión para el header/nav en la vista
            const user = req.session ? req.session.user : null;
            res.render("editar", { libros: result[0], user })
        }
    })
})

// PUT - Actualizar libro existente
ruta.put('/editar/:id', (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            console.log("Error en multer:", err);
            return res.status(400).send("Error al subir la imagen: " + err.message);
        }
        
        const id = req.params.id;
        const { nombre_libro, autor_libro, cantidad_lirbo, categoria_libro,descripcion_libro } = req.body;

        // Primero obtener la imagen actual del libro
        db.query("SELECT imagen FROM libros WHERE id_libro = ?", [id], (err, result) => {
            if (err) {
                console.log("Error al obtener imagen existente:", err);
                return res.status(500).send("Error interno del servidor");
            }

            const imagenActual = result[0].imagen;
            let nuevaImagen = imagenActual; 

            console.log("Imagen actual en BD:", imagenActual);
            console.log("¿Se subió nueva imagen?", !!req.file);

            // Si se subió una nueva imagen
            if (req.file) {
                nuevaImagen = req.file.filename;
                console.log("Nueva imagen:", nuevaImagen);
                
                // Eliminar la imagen anterior si existe y es diferente a la nueva
                if (imagenActual && imagenActual !== nuevaImagen) {
                    console.log("Eliminando imagen anterior:", imagenActual);
                    const rutaImagenAnterior = path.join(__dirname, "../PUBLIC/upload/", imagenActual);
                    console.log("Ruta de imagen anterior:", rutaImagenAnterior);
                    
                    if (fs.existsSync(rutaImagenAnterior)) {
                        console.log("La imagen anterior existe, eliminando...");
                        fs.unlink(rutaImagenAnterior, (err) => {
                            if (err) {
                                console.log(" Error al eliminar la imagen anterior:", err);
                            } else {
                                console.log("Imagen anterior eliminada exitosamente:", imagenActual);
                            }
                        });
                    } else {
                        console.log("La imagen anterior no existe en el sistema de archivos:", imagenActual);
                    }
                } else {
                    console.log("No se elimina imagen anterior porque:", 
                        !imagenActual ? "No había imagen anterior" : "La imagen es la misma");
                }
            } else {
                console.log("No se subió nueva imagen, manteniendo la actual:", imagenActual);
            }

            // Actualizar el libro en la base de datos
            console.log("Actualizando libro con imagen:", nuevaImagen);
            actualizarLibro(nuevaImagen);
        });

        function actualizarLibro(imagenFinal) {
            db.query("UPDATE libros SET nombre = ?, autor = ?, cantidad = ?, categoria = ?,descripcion = ? ,imagen = ? WHERE id_libro = ?",
                [nombre_libro, autor_libro, cantidad_lirbo, categoria_libro, descripcion_libro,imagenFinal, id], (err, result) => {
                    if (err) {
                        console.log("Error al editar el libro con el id " + id + ":", err);
                        return res.status(500).send("Error al actualizar el libro");
                    } else {
                        const idActualizado = req.params.id;
                        console.log(" Libro editado con éxito con el id " + idActualizado);
                        console.log("=== FIN EDICIÓN LIBRO ===");
                        return res.redirect("/catalogoLibros");
                    }
                }
            );
        }
    });
});

module.exports = ruta;