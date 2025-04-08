module.exports = {
  apps: [
    {
      name: 'whaticket-backend',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080
      }
    },
    {
      name: 'whaticket-queue',
      script: 'dist/queue.js',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'whaticket.com',
      ref: 'origin/main',
      repo: 'git@github.com:seu-usuario/whaticket-saas.git',
      path: '/var/www/whaticket',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
}; 