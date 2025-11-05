const express = require("express");
const app = express()
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");


app.use(session({
    secret: process.env.SESSION_SECRET || 'mi_secreto',
    resave: false,
    saveUninitialized: true
}));



//configuración VIEWS
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "VIEWS"));
// Desactivar cache de vistas para desarrollo
app.disable('view cache');

//CONFIGURACIÓN
app.use(express.static(path.join(__dirname,"PUBLIC")));
// Evitar cache de respuestas HTML en desarrollo
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// SEO: robots.txt y sitemap.xml
app.get('/robots.txt', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(
`User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
`);
});

app.get('/sitemap.xml', async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const today = new Date().toISOString().slice(0, 10);
  // Páginas principales conocidas. Para páginas dinámicas (infoLibro/:id) se puede extender
  // generando URLs desde la base de datos si se requiere.
  const urls = [
    '/',
    '/catalogoLibros',
    '/prestamos',
    '/usuarios',
    '/registrarLibro'
  ];

  const urlset = urls.map(u => (
`  <url>
    <loc>${baseUrl}${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u === '/' ? '1.0' : '0.8'}</priority>
  </url>`)).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

  res.type('application/xml').send(xml);
});


//RUTAS
app.use(require("./ROUTERS/index.ruta.js"));//index
app.use(require("./ROUTERS/libros/registroLibros.ruta.js"));//registro de libros
app.use(require("./ROUTERS/libros/editarLibro.ruta.js"));// editar libro
app.use(require("./ROUTERS/libros/eliminarLibro.ruta.js"));// eliminar libros
app.use(require("./ROUTERS/libros/buscarLibro.ruta.js")); // search
app.use(require("./ROUTERS/usuarios/registrarUsuario.ruta.js")); // registrar usuario
app.use(require("./ROUTERS/usuarios/recuperarPassword.ruta.js"))// recuperar contraseña
app.use(require("./ROUTERS/usuarios/login.ruta.js"));
app.use(require("./ROUTERS/libros/infoLibro.ruta.js"));// info libro}
app.use(require("./ROUTERS/prestamo.ruta.js"));//prestamo
app.use(require("./ROUTERS/libros/catalogoLibro.ruta.js"));// catalogo de libros
app.use("/usuarios", require("./ROUTERS/usuarios/usuarios.ruta.js"));//usuarios



//SERVIDOR
app.listen(PORT, ()=>{
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    
})
