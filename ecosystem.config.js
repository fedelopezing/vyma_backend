module.exports = {
  apps: [
    {
      name: 'biolimpieza-api',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      wait_ready: true,
      kill_timeout: 3000,
      max_memory_restart: '500M',

      out_file: '/var/log/biolimpieza-api/out.log',
      error_file: '/var/log/biolimpieza-api/error.log',
      merge_logs: true,

      env: {
        NODE_ENV: 'production',
        STAGE: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
        STAGE: 'production',
        CHROME_PATH: '/usr/bin/chromium-browser',
        NO_SANDBOX: 'true'
      },
      node_args: ['--max_old_space_size=1024'],
    },
  ],
};
