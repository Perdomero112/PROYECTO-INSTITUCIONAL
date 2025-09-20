const multer = require("multer");
const path = require("path");
const db = require("../CONFIG/db");

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../PUBLIC/upload");
        console.log("Directorio de destino:", uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const id = req.params.id
        // Generar nombre único para evitar conflictos
        const nombreUnico =   id +'-'+file.originalname.split('').join('') + '-' ;
        cb(null, "BG" + '-' + nombreUnico + path.extname(file.originalname));
    }
});

// Filtro para solo pemitir imagenes
const fileFilter = (req, file, cb) => {
    // Verificar si es una imagen
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
}).single("imagen");

module.exports = upload;