const express = require('express');
const router = express.Router();
const db = require("../../CONFIG/db");
const { sessionMiddleware, tipoUsuario } = require("../../MIDDLEWARE/sesion.middleware");



// Ruta para mostrar la lista de usuarios
router.get('/', sessionMiddleware, tipoUsuario, (req, res) => {
    console.log("Accediendo a la ruta de usuarios");
    console.log("Usuario de sesión:", req.session.user);

    const terminoBusqueda = (req.query.q || '').trim();

    let sql = "SELECT * FROM usuarios";
    const params = [];

    if (terminoBusqueda) {
        sql += " WHERE CAST(id_usr AS CHAR) LIKE ? OR docum_usr LIKE ? OR nombre_usr LIKE ? OR telefono_usr LIKE ?";
        const like = `%${terminoBusqueda}%`;
        params.push(like, like, like, like);
    }

    sql += " ORDER BY id_usr DESC";
    console.log("Ejecutando consulta:", sql, "con params:", params);

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Error al obtener los usuarios:", err);
            res.status(500).json({ error: "Error al obtener los usuarios" });
            return;
        }
        
        console.log("Resultados de la consulta:", results);
        console.log("Número de usuarios encontrados:", results.length);
        
        res.render("usuarios", { 
            users: results,
            user: req.session.user,
            terminoBusqueda
        });
    });
});

// Eliminar usuario (solo admin)
router.post('/eliminar/:id', sessionMiddleware, tipoUsuario, (req, res) => {
  const { id } = req.params;
  const actor = req.session.user;
  
  if (!actor || actor.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }
  
  const sql = 'DELETE FROM usuarios WHERE id_usr = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar usuario:', err);
      // Posibles errores por restricciones de clave foránea
      return res.status(500).json({ error: 'No se pudo eliminar el usuario', details: err.code || err.message });
    }
    // Si no afectó filas, el usuario no existía
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Redirigir a la lista
    return res.redirect('/usuarios');
  });
});

module.exports = router;