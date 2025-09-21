const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const conexion = mysql.createConnection({
    host: process.env.DB_HOST || "31.97.133.12",
    database: process.env.DB_NAME || "biblioteca_ie-bg",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Perdomero-11",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    multipleStatements: false
});

conexion.connect((err) => {
    if (err) {
        console.log(
            `Hubo un problema al conectar con la base de datos: ${err}`
        );
    } else {
        console.log(
            `Conectado a la base de datos en ${conexion.config.host}:${conexion.config.port} (DB: ${conexion.config.database})`
        );
    }
});

module.exports = conexion;
