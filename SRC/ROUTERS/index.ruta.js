const db = require("../CONFIG/db");
const express = require("express")
const ruta = express.Router();
const {sessionMiddleware,tipoUsuario} = require("../MIDDLEWARE/sesion.middleware");


ruta.get("/", sessionMiddleware, tipoUsuario, (req, res) => {
    // Consultas paralelas para obtener todos los datos necesarios
    const queries = {
        librosAletorios: "SELECT * FROM libros ORDER BY RAND() LIMIT 3",
        librosPorCategoria: "SELECT categoria FROM libros ORDER BY RAND() LIMIT 3",
        usuarios: "SELECT * FROM usuarios",
        roles: "SELECT DISTINCT rol FROM usuarios"
    };

    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;
    const results = {};

    // Función para verificar si todas las consultas han terminado
    const checkAllQueriesComplete = () => {
        completedQueries++;
        if (completedQueries === totalQueries) {
            // Todas las consultas terminaron, renderizar la vista
            // Obtener mensajes de query params
            const success = req.query.success || null;
            const error = req.query.error || null;
            
            res.render("index", { 
                librosAletorios: results.librosAleatorios || [], 
                librosPorCatalogo: results.librosPorCategoria || [],
                usuarios: results.usuarios || [],
                roles: results.roles || [],
                user: req.session.user,
                success: success,
                error: error
            });
        }
    };

    // Ejecutar consulta de libros aleatorios
    db.query(queries.librosAletorios, (err, libros) => {
        if (err) {
            console.log("Error al obtener libros aleatorios:", err);
            results.librosAleatorios = [];
        } else {
            console.log("Libros aleatorios obtenidos:", libros.length);
            results.librosAleatorios = libros || [];
        }
        checkAllQueriesComplete();
    });

    // Ejecutar consulta de libros por categoría
    db.query(queries.librosPorCategoria, (err, libros) => {
        if (err) {
            console.log("Error al obtener libros por categoría:", err);
            results.librosPorCategoria = [];
        } else {
            console.log("Libros por categoría obtenidos:", libros.length);
            results.librosPorCategoria = libros || [];
        }
        checkAllQueriesComplete();
    });

    // Ejecutar consulta de usuarios
    db.query(queries.usuarios, (err, usuarios) => {
        if (err) {
            console.log("Error al obtener usuarios:", err);
            results.usuarios = [];
        } else {
            console.log("Usuarios obtenidos:", usuarios.length);
            results.usuarios = usuarios || [];
        }
        checkAllQueriesComplete();
    });

    // Ejecutar consulta de roles
    db.query(queries.roles, (err, roles) => {
        if (err) {
            console.log("Error al obtener roles:", err);
            results.roles = [];
        } else {
            console.log("Roles obtenidos:", roles.length);
            results.roles = roles || [];
        }
        checkAllQueriesComplete();
    });
})

module.exports = ruta;