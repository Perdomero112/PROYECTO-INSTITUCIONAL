const express = require("express")
const ruta = express.Router();
const db = require("../../CONFIG/db");
const upload = require("../../MIDDLEWARE/multerConfig");
const path = require("path");





//ruta para el formulario de registro
ruta.get("/registrarLibro", (req,res)=>{
    console.log("Accediendo a la ruta /registrarLibro");
    res.render("registrarLibro", {
        user: req.session.user
    })
})


//registro POST
ruta.post("/registro",upload ,(req, res) => {
    
        procesarRegistro(req, res);
    });


async function procesarRegistro(req, res) {
    
    let datosLibro = req.body
    
    let nombreLibro = datosLibro.nombre_libro
    let autorLibro = datosLibro.autor
    let cantidadLibro = datosLibro.cantidad
    let categoriaLibro = datosLibro.categoria

    let imagenLibro = req.file ? req.file.filename: null;

    console.log("Datos extraídos:");
    console.log("- Nombre:", nombreLibro);
    console.log("- Autor:", autorLibro);
    console.log("- Cantidad:", cantidadLibro);
    console.log("- Categoría:", categoriaLibro);
    console.log("- Imagen:", imagenLibro);

    let registroLibroSql = "INSERT INTO libros (nombre,autor,cantidad,categoria,imagen) VALUE (?,?,?,?,?)"

    db.query(registroLibroSql, [nombreLibro,autorLibro,cantidadLibro,categoriaLibro,imagenLibro], (err, result)=>{

        if (err) {
            console.log("Error al registrar el libro:", err);
            return res.render("registrarLibro", { 
                user: req.session.user, 
                error: "Error al registrar el libro",
                success: null 
            });
        } else {
            console.log("Libro registrado con éxito con el id " + result.insertId);
            console.log("=== FIN REGISTRO LIBRO ===");
            return res.render("registrarLibro", { 
                user: req.session.user, 
                error: null,
                success: "¡Libro registrado exitosamente!" 
            });
        }
    })
}



module.exports = ruta;