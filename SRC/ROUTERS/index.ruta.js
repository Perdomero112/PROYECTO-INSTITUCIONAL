const db = require("../CONFIG/db");
const express = require("express")
const ruta = express.Router();
const {sessionMiddleware,tipoUsuario} = require("../MIDDLEWARE/sesion.middleware");


ruta.get("/", sessionMiddleware, tipoUsuario, (req, res) => {
    // Consultas paralelas para obtener todos los datos necesarios
    const queries = {
        librosAletorios: "SELECT * FROM libros ORDER BY RAND() LIMIT 3",
        // Nota: librosPorCategoria se resolverá en dos pasos: escoger 1 categoría y luego 3 libros de esa categoría.
        usuarios: "SELECT * FROM usuarios",
        roles: "SELECT DISTINCT rol FROM usuarios"
    };

    let completedQueries = 0;
    // totalQueries cuenta: librosAletorios, usuarios, roles y (librosPorCategoria final)
    const totalQueries = Object.keys(queries).length + 1;
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
                categoriaSeleccionada: results.categoriaSeleccionada || null,
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

    // Seleccionar UNA categoría aleatoria y luego 3 libros de esa categoría
    const categoriaSql = "SELECT DISTINCT categoria FROM libros WHERE categoria IS NOT NULL AND categoria <> '' ORDER BY RAND() LIMIT 1";
    db.query(categoriaSql, (err, filasCat) => {
        if (err) {
            console.log("Error al obtener categoría aleatoria:", err);
            results.categoriaSeleccionada = null;
            results.librosPorCategoria = [];
            return checkAllQueriesComplete();
        }
        const categoria = filasCat && filasCat.length ? filasCat[0].categoria : null;
        results.categoriaSeleccionada = categoria;

        if (!categoria) {
            results.librosPorCategoria = [];
            return checkAllQueriesComplete();
        }

        const librosPorCatSql = "SELECT id_libro, nombre, autor, imagen, cantidad, categoria FROM libros WHERE categoria = ? ORDER BY RAND() LIMIT 3";
        db.query(librosPorCatSql, [categoria], (err2, libros) => {
            if (err2) {
                console.log("Error al obtener libros por categoría seleccionada:", err2);
                results.librosPorCategoria = [];
            } else {
                console.log(`Libros obtenidos de la categoría '${categoria}':`, libros.length);
                results.librosPorCategoria = libros || [];
            }
            checkAllQueriesComplete();
        });
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