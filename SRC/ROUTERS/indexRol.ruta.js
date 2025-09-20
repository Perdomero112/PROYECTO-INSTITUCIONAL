const  express = require('express');
const ruta = express.Router();
const db = require('../DB/db');
const tipoUsuario = require('../MIDDLEWARE/sesion.middleware.js');

ruta.get('/rol', tipoUsuario, async (req, res) => {
    try {
        const roles = await db.query('SELECT * FROM roles');  
    }catch (error)   {
        console.error('Error al obtener los roles:', error);
        res.status(500).json({ error: 'Error al obtener los roles' });
    }
});
module.exports = ruta;