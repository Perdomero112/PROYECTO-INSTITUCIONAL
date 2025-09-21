module.exports = {
  apps: [
    {
      name: 'biblioteca-institucional-bg',
      script: 'SRC/index.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        // Server
        PORT: 3000,
        SESSION_SECRET: 'cambia_este_valor_en_produccion',
        // Database
        DB_HOST: '31.97.133.12',
        DB_NAME: 'biblioteca_ie-bg',
        DB_USER: 'root',
        DB_PASSWORD: 'cambia_esta_contraseña_en_el_vps',
        DB_PORT: 3306,
        // Email (si usas Gmail con App Password)
        EMAIL_HOST: 'smtp.gmail.com',
        EMAIL_PORT: 587,
        EMAIL_SECURE: 'false',
        EMAIL_USER: 'bibliotecaappbg00@gmail.com',
        EMAIL_PASS: 'cambia_este_app_password'
      }
    }
  ]
}
