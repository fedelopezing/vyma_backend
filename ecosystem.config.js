module.exports = {
  apps: [
    {
      name: 'biolimpieza-api',
      script: 'dist/main.js',
      instances: 'max', // Usa todos los núcleos del CPU
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        STAGE: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
        STAGE: 'production',
      },
    },
  ],
};
