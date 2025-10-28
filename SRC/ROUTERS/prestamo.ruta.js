const express = require("express");
const ruta = express.Router();
const db = require("../CONFIG/db");
const { sessionMiddleware, tipoUsuario } = require("../MIDDLEWARE/sesion.middleware");

ruta.get("/prestamos", tipoUsuario, sessionMiddleware, async (req, res) => {
    try {
        let prestamos;
        
        // Si es admin, mostrar todos los préstamos
        if (req.session.user.rol === 'admin') {
            prestamos = `SELECT 
                                p.id_prest,
                                p.id_usr,
                                p.id_libro,
                                p.fecha,
                                p.observacion,
                                p.cantidad_prest,
                                p.estado,
                                l.nombre as nombre_libro,
                                u.nombre_usr AS nombre_usr,
                                u.rol,
                                u.grado_std AS grado,
                                u.curso_std AS curso
                                FROM prestamos p
                                LEFT JOIN libros l ON p.id_libro = l.id_libro
                                LEFT JOIN usuarios u ON p.id_usr = u.id_usr
                                ORDER BY p.id_prest DESC`;
        } else {
            // Si es usuario normal, mostrar solo sus préstamos, incluyendo su nombre
            prestamos = `SELECT 
                                p.id_prest,
                                p.id_usr,
                                p.id_libro,
                                p.fecha,
                                p.observacion,
                                p.cantidad_prest,
                                p.estado,
                                l.nombre AS nombre_libro,
                                u.nombre_usr AS nombre_usr,
                                u.grado_std AS grado,
                                u.curso_std AS curso
                                FROM prestamos p
                                LEFT JOIN libros l ON p.id_libro = l.id_libro
                                LEFT JOIN usuarios u ON p.id_usr = u.id_usr
                                WHERE p.id_usr = ?
                                ORDER BY p.id_prest DESC`;
        }
        
        console.log("Ejecutando consulta SQL:", prestamos);
        const queryParams = (req.session.user.rol === 'admin') ? [] : [req.session.user.id];
        console.log("Parámetros de consulta:", queryParams);
        
        db.query(prestamos, queryParams, (err, results) => {
            if (err) {
                console.log("Error SQL detallado:", err);
                console.log("Código de error:", err.code);
                console.log("Mensaje de error:", err.message);
                return res.status(500).json({ 
                    error: "Error al obtener los prestamos",
                    details: err.message 
                });
            }
            console.log("Consulta exitosa, resultados:", results.length, "registros");
            if (results.length > 0) {
                console.log("Estructura del primer resultado:", Object.keys(results[0]));
                console.log("Primer resultado completo:", results[0]);
            }
            
            // Verificar préstamos en mora
            const hoy = new Date();
            console.log("Fecha actual:", hoy);
            
            results.forEach(element => {
                const fechaEntrega = new Date(element.fecha);
                if (fechaEntrega < hoy) {
                    element.enMora = true;
                    element.mensaje = `el libro ${element.nombre_libro} esta en mora su fecha de entrega es ${element.fecha}`;
                } else {
                    element.enMora = false;
                    element.mensaje = "";
                }
            });
            
            res.render("prestamos", { prestamos: results, user: req.session.user });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error al obtener los prestamos" });
    }
});

//Ruta para solicitar prestamo (desde el modal)
ruta.post("/solicitarPrestamo", tipoUsuario, sessionMiddleware, async (req, res) => {
    const { id_libro, id_usr, fecha, observacion, cantidad } = req.body;
    const estado = "pendiente";
    
    console.log("Datos recibidos:", { id_libro, id_usr, fecha, observacion, cantidad, estado });
    
    // Consulta con el nombre correcto de columna cantidad_prest
    const sql = "INSERT INTO prestamos (id_usr, id_libro, fecha, observacion, cantidad_prest, estado) VALUES (?, ?, ?, ?, ?, ?)";
    
    console.log("Ejecutando SQL:", sql);
    console.log("Parámetros:", [id_usr, id_libro, fecha, observacion, cantidad, estado]);
    
    db.query(sql, [id_usr, id_libro, fecha, observacion, cantidad, estado], (err, results) => {
        if (err) {
            console.log("Error SQL detallado:", err);
            console.log("Código de error:", err.code);
            console.log("Mensaje:", err.message);
            return res.status(500).json({ 
                error: "Error al solicitar el préstamo",
                details: err.message 
            });
        }
        console.log("Préstamo insertado exitosamente");
        res.redirect("/prestamos");
    });
});

//Ruta para aceptar prestamo
ruta.post("/aceptarPrestamo/:id", tipoUsuario, sessionMiddleware, async (req, res) => {
    const idPrestamo = req.params.id;
    const { idLibro, observacion } = req.body;
    const fechaAceptacion = new Date();
    const estado = "en prestamo";
    
    // Primero obtener la cantidad del préstamo
    const sqlGetPrestamo = "SELECT cantidad_prest, id_libro FROM prestamos WHERE id_prest = ?";
    
    db.query(sqlGetPrestamo, [idPrestamo], (err, prestamoResults) => {
        if (err) {
            console.log("Error al obtener préstamo:", err);
            return res.status(500).json({ error: "Error al obtener el préstamo" });
        }
        
        if (prestamoResults.length === 0) {
            return res.status(404).json({ error: "Préstamo no encontrado" });
        }
        
        const cantidadPrestamo = prestamoResults[0].cantidad_prest;
        const libroId = prestamoResults[0].id_libro;
        
        // Actualizar el estado del préstamo a "en prestamo" y guardar observación si viene
        const sql = "UPDATE prestamos SET estado = ?, fecha = ?, observacion = COALESCE(?, observacion) WHERE id_prest = ?";
        // Restar la cantidad correcta del libro
        const sql2 = "UPDATE libros SET cantidad = cantidad - ? WHERE id_libro = ?";
        
        db.query(sql, [estado, fechaAceptacion, observacion || null, idPrestamo], (err, results) => {
            if (err) {
                console.log("Error al aceptar préstamo:", err);
                return res.status(500).json({ error: "Error al aceptar el préstamo" });
            }
            db.query(sql2, [cantidadPrestamo, libroId], (err2, results2) => {
                if (err2) {
                    console.log("Error al actualizar cantidad del libro:", err2);
                    return res.status(500).json({ error: "Error al actualizar el libro" });
                }
                console.log(`Préstamo aceptado: restando ${cantidadPrestamo} unidades del libro ${libroId}`);
                res.redirect("/prestamos");
            });
        });
    });
});

//Ruta para devolver prestamo
ruta.post("/devolverPrestamo/:id", tipoUsuario,sessionMiddleware, async (req, res)=>{
    const idPrestamo = req.params.id;
    const { idLibro } = req.body;
    const fechaDevolucion = new Date();
    const observacion = req.body.observacion || 'Libro devuelto correctamente';
    const estado = "devuelto";
    
    // Primero obtener la cantidad del préstamo para devolverla al inventario
    const sqlGetCantidad = "SELECT cantidad_prest, id_libro FROM prestamos WHERE id_prest = ?";
    
    db.query(sqlGetCantidad, [idPrestamo], (err, results) => {
        if (err) {
            console.log("Error al obtener cantidad del préstamo:", err);
            return res.status(500).json({ error: "Error al procesar devolución" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: "Préstamo no encontrado" });
        }
        
        const cantidadPrestamo = results[0].cantidad_prest;
        const libroId = results[0].id_libro;
        
        // Actualizar el estado del préstamo
        const sql = "UPDATE prestamos SET fecha = ?, observacion = ?, estado = ? WHERE id_prest = ?";
        // Devolver la cantidad al inventario del libro
        const sql2 = "UPDATE libros SET cantidad = cantidad + ? WHERE id_libro = ?";
        
        db.query(sql, [fechaDevolucion, observacion, estado, idPrestamo], (err, results) => {
            if (err) {
                console.log("Error al devolver préstamo:", err);
                return res.status(500).json({ error: "Error al devolver el préstamo" });
            }
            db.query(sql2, [cantidadPrestamo, libroId], (err2, results2) => {
                if (err2) {
                    console.log("Error al actualizar inventario del libro:", err2);
                    return res.status(500).json({ error: "Error al actualizar el inventario" });
                }
                console.log(`Préstamo devuelto: sumando ${cantidadPrestamo} unidades al libro ${libroId}`);
                res.redirect("/prestamos");
            });
        });
    });
});

//Ruta para eliminar prestamo
ruta.post("/eliminarPrestamo/:id", tipoUsuario,sessionMiddleware, async (req, res)=>{
    const idPrestamo = req.params.id;
    const sql = "DELETE FROM prestamos WHERE id_prest = ?";
    db.query(sql, [idPrestamo], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error al eliminar el prestamo" });
        }
        res.redirect("/prestamos");
    });
});

//ruta para prestamos en mora

    

//Ruta para buscar prestamo
ruta.get("/buscarPrestamo", tipoUsuario, sessionMiddleware, async (req, res) => {
    const terminoBusqueda = req.query.q || '';
    const filtroEstado = req.query['opcion-busqueda'] || '';
    
    let whereConditions = [];
    let queryParams = [];
    
    // Construir condiciones WHERE
    if (req.session.user.rol !== 'admin') {
        whereConditions.push('p.id_usr = ?');
        queryParams.push(req.session.user.id);
    }
    
    // Filtro por estado
    if (filtroEstado) {
        switch(filtroEstado) {
            case 'pendientes':
                whereConditions.push("p.estado = 'pendiente'");
                break;
            case 'enPrestamo':
                whereConditions.push("p.estado = 'en prestamo'");
                break;
            case 'devueltos':
                whereConditions.push("p.estado = 'devuelto'");
                break;
            case 'morosos':
                whereConditions.push("p.fecha < CURDATE() AND p.estado != 'devuelto'");
                break;
        }
    }
    
    // Búsqueda por término (usar OR entre los campos buscables)
    if (terminoBusqueda) {
        const termLike = `%${terminoBusqueda}%`;
        // Grupo OR: id de préstamo, nombre del libro, nombre del estudiante, observación
        whereConditions.push("(CAST(p.id_prest AS CHAR) LIKE ? OR l.nombre LIKE ? OR u.nombre_usr LIKE ? OR p.observacion LIKE ?)");
        queryParams.push(termLike, termLike, termLike, termLike);
    }
    
    let prestamosBusqueda;
    if (req.session.user.rol === 'admin') {
        prestamosBusqueda = `SELECT 
                            p.id_prest,
                            p.id_usr,
                            p.id_libro,
                            p.fecha,
                            p.observacion,
                            p.cantidad_prest,
                            p.estado,
                            l.nombre as nombre_libro,
                            u.nombre_usr AS nombre_usr,
                            u.rol,
                            u.grado_std AS grado,
                            u.curso_std AS curso
                            FROM prestamos p
                            LEFT JOIN libros l ON p.id_libro = l.id_libro
                            LEFT JOIN usuarios u ON p.id_usr = u.id_usr`;
    } else {
        prestamosBusqueda = `SELECT 
                            p.id_prest,
                            p.id_usr,
                            p.id_libro,
                            p.fecha,
                            p.observacion,
                            p.cantidad_prest,
                            p.estado,
                            l.nombre as nombre_libro,
                            u.nombre_usr AS nombre_usr,
                            u.grado_std AS grado,
                            u.curso_std AS curso
                            FROM prestamos p
                            LEFT JOIN libros l ON p.id_libro = l.id_libro
                            LEFT JOIN usuarios u ON p.id_usr = u.id_usr`;
    }
    
    if (whereConditions.length > 0) {
        prestamosBusqueda += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    prestamosBusqueda += ` ORDER BY p.id_prest DESC`;
    
    console.log("Consulta de búsqueda:", prestamosBusqueda);
    console.log("Parámetros:", queryParams);
    
    db.query(prestamosBusqueda, queryParams, (err, results) => {
        if (err) {
            console.log("Error en búsqueda:", err);
            return res.status(500).json({ error: "Error al buscar el prestamo" });
        }
        res.render("prestamos", { 
            prestamos: results, 
            user: req.session.user,
            terminoBusqueda: terminoBusqueda,
            filtroEstado: filtroEstado
        });
    });
});

module.exports = ruta;