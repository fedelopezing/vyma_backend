module.exports = {
  apps: [
    {
      name: 'vyma-backend',
      script: 'dist/main.js',
      instances: 2, // Optimizado para 2GB de RAM (provee redundancia y recarga sin downtime)
      exec_mode: 'cluster',
      autorestart: true,
      wait_ready: true, // Requiere llamar a process.send('ready') en main.ts
      listen_timeout: 10000, // Tiempo máximo de espera para la señal ready
      kill_timeout: 3000,
      max_memory_restart: '400M', // Reinicia si el proceso individual pasa los 400MB para evitar OOM

      // Logs relativos para evitar problemas de permisos de escritura de root
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,

      env: {
        NODE_ENV: 'production',
        STAGE: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
        STAGE: 'production',
        CHROME_PATH: '/usr/bin/chromium-browser',
        NO_SANDBOX: 'true',
      },
      node_args: ['--max_old_space_size=768'], // Limita el heap memory de node a 768MB
    },
  ],
};
