const express = require('express');
const ruta = express.Router();
const db = require('../../CONFIG/db');
const fs = require("fs");
const path = require("path");

// DELETE - Eliminar libro (usando POST-method-override)
ruta.delete('/eliminar/:id', (req, res) => {
    let id = req.params.id;
    
    console.log("Intentando eliminar libro con id: " + id);
    
    // Primero obtener la imagen del libro
    db.query("SELECT imagen FROM libros WHERE id_libro = ?", [id], (err, result) => {
        if (err) {
            console.log("Error al consultar la imagen del libro:", err);
            return res.status(500).send("Error al consultar el libro");
        }
        
        let imagen_libro = null;
        if (result.length > 0 && result[0].imagen) {
            imagen_libro = result[0].imagen;
        }
        
        // Eliminar el registro de la base de datos
        db.query("DELETE FROM libros WHERE id_libro = ?", [id], (err2, result2) => {
            if (err2) {
                console.log("Error al eliminar el libro con id " + id + ": " + err2);
                return res.status(500).send("Error al eliminar el libro");
            } else {
                // Eliminar la imagen del sistema de archivos
                eliminarImagen(imagen_libro);
                console.log("Libro eliminado con éxito con el id " + id);
                return res.redirect("/catalogoLibros?success=Libro eliminado exitosamente");
            }
        });
    });
});

// POST - Eliminar libro alternativo sin method-override
ruta.post('/eliminar/:id', (req, res) => {
    let id = req.params.id;

    console.log("Intentando eliminar libro con id: " + id);
    
    // Primero obtener la imagen del libro
    db.query("SELECT imagen FROM libros WHERE id_libro = ?", [id], (err, result) => {
        if (err) {
            console.log("Error al consultar la imagen del libro:", err);
            return res.status(500).send("Error al consultar el libro");
        }
        
        let imagen_libro = null;
        if (result.length > 0 && result[0].imagen) {
            imagen_libro = result[0].imagen;
        }
        
        // Eliminar el registro de la base de datos
        db.query("DELETE FROM libros WHERE id_libro = ?", [id], (err2, result2) => {
            if (err2) {
                console.log("Error al eliminar el libro con id " + id + ": " + err2);
                return res.status(500).send("Error al eliminar el libro");
            } else {
                // Eliminar la imagen del sistema de archivos
                eliminarImagen(imagen_libro);
                console.log("Libro eliminado con éxito con el id " + id);
                return res.redirect("/catalogoLibros");
            }
        });
    });
});

// POST - Eliminar solo la imagen del libro
ruta.post('/eliminar-imagen/:id', (req, res) => {
    let id = req.params.id;
    
    console.log("Eliminando solo la imagen del libro con id: " + id);
    
    // Obtener la imagen actual del libro
    db.query("SELECT imagen FROM libros WHERE id_libro = ?", [id], (err, result) => {
        if (err) {
            console.log("Error al obtener imagen existente:", err);
            return res.status(500).send("Error interno del servidor");
        }
        
        if (result.length === 0) {
            return res.status(404).send("Libro no encontrado");
        }
        
        const imagenActual = result[0].imagen;
        
        if (!imagenActual) {
            return res.status(400).send("El libro no tiene imagen para eliminar");
        }
        
        // Eliminar el archivo físico del directorio uploads
        const rutaImagen = path.join(__dirname, "../PUBLIC/upload/", imagenActual);
        
        if (fs.existsSync(rutaImagen)) {
            fs.unlink(rutaImagen, (err) => {
                if (err) {
                    console.log("Error al eliminar la imagen del sistema de archivos:", err);
                    return res.status(500).send("Error al eliminar la imagen del servidor");
                } else {
                    console.log("Imagen eliminada del sistema de archivos:", imagenActual);
                    
                    // Actualizar la base de datos para eliminar la referencia a la imagen
                    db.query("UPDATE libros SET imagen = NULL WHERE id_libro = ?", [id], (err, result) => {
                        if (err) {
                            console.log("Error al actualizar la base de datos:", err);
                            return res.status(500).send("Error al actualizar la base de datos");
                        } else {
                            console.log("Imagen eliminada exitosamente del libro con id: " + id);
                            res.redirect("/");
                        }
                    });
                }
            });
        } else {
            console.log("La imagen no existe en el sistema de archivos, solo eliminando de la base de datos");
            
            // Si el archivo no existe físicamente, solo eliminar de la base de datos
            db.query("UPDATE libros SET imagen = NULL WHERE id_libro = ?", [id], (err, result) => {
                if (err) {
                    console.log("Error al actualizar la base de datos:", err);
                    return res.status(500).send("Error al actualizar la base de datos");
                } else {
                    console.log("Referencia de imagen eliminada de la base de datos");
                    res.redirect("/");
                }
            });
        }
    });
});

// Función auxiliar para eliminar imagen
function eliminarImagen(nombreImagen) {
    if (nombreImagen) {
        const rutaImagen = path.join(__dirname, "../PUBLIC/upload/", nombreImagen);
        
        // Verificar si el archivo existe
        if (fs.existsSync(rutaImagen)) {
            fs.unlink(rutaImagen, (err) => {
                if (err) {
                    console.log("Error al eliminar la imagen de la carpeta upload:", err);
                } else {
                    console.log("Imagen eliminada de la carpeta upload exitosamente:", nombreImagen);
                }
            });
        } else {
            console.log("La imagen no existe en el sistema de archivos:", nombreImagen);
        }
    }
}

module.exports = ruta;