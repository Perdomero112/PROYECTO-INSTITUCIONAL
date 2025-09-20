const mysql = require("mysql2");

const conexion = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "biblioteca_ie-bg",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
});

conexion.connect((err) => {
    if (err) {
        console.log(`Hubo un problema al conectar con la base de datos: ${err}`);
    } else {
        console.log("Conectado a la base de datos");
    }
});

module.exports = conexion;
