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
        NODE_ENV: 'production'
      }
    }
  ]
}
