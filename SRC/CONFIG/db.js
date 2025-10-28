const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

// Configuración priorizando variables de entorno y valores por defecto.
// Usar process.env para permitir configuración en la VPS / producción.
const conexion = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || process.env.DB_NAME || 'biblioteca_ie_bg',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
});

conexion.connect((err) => {
    if (err) {
        console.log(`Hubo un problema al conectar con la base de datos: ${err}`);
    } else {
        console.log(`Conectado a la base de datos en ${conexion.config.host}:${conexion.config.port} (DB: ${conexion.config.database})`);
    }
});

module.exports = conexion;
