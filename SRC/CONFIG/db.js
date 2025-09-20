const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const conexion = mysql.createConnection({
    host: process.env.DB_HOST, //host de la base de datos VPS 
    database: process.env.DB_NAME, //nombre de la base de datos
    user: process.env.DB_USER, //usuario de la base de datos
    password: process.env.DB_PASSWORD, //contraseña de la base de datos
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306 //puerto de la base de datos
});

conexion.connect((err) => {
    if (err) {
        console.log(`Hubo un problema al conectar con la base de datos: ${err}`);
    } else {
        console.log("Conectado a la base de datos");
    }
});

module.exports = conexion;
