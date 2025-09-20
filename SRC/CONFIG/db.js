const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const conexion = mysql.createConnection({
    host: "31.97.133.12",
    database: "biblioteca_ie-bg",
    user: "root",
    password: "Perdomero-11",
    port: 3306
});

conexion.connect((err) => {
    if (err) {
        console.log(`Hubo un problema al conectar con la base de datos: ${err}`);
    } else {
        console.log("Conectado a la base de datos");
    }
});

module.exports = conexion;
