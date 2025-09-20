const mysql = require("mysql2");

const conexion = mysql.createConnection({
    host: "localhost",
    database: "biblioteca_ie-bg",
    user: "root",
    password: ""
});

conexion.connect((err) => {
    if (err) {
        console.log(`Hubo un problema al conectar con la base de datos: ${err}`);
    } else {
        console.log("Conectado a la base de datos");
    }
});

module.exports = conexion;


