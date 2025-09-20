const sessionMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        // El usuario está autenticado, continuar con la solicitud
        next();
    } else {
        // El usuario no está autenticado, redirigir al login
        req.session.returnTo =  "/"; // Guardar la URL original
        res.redirect('/login');
    }
};

const tipoUsuario = (req, res, next) => {
    // Middleware para verificar el tipo de usuario
    // Por ahora solo pasa al siguiente middleware
    // Aquí podrías agregar lógica adicional si es necesario
    next();
};

module.exports = { sessionMiddleware, tipoUsuario };