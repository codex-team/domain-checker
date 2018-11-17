module.exports = {apps: [
  {
    name: 'zoneCheck',
    script: 'zoneCheck/index.js',

    instances: 1,
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    env: { NODE_ENV: 'dev' },
    env_production: { NODE_ENV: 'production' }
  },
  {
    name: 'whois',
    script: 'whois/index.js',

    instances: 1,
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    env: { NODE_ENV: 'dev' },
    env_production: { NODE_ENV: 'production' }
  },
  {
    name: 'responder',
    script: 'responder/index.js',

    instances: 1,
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    env: { NODE_ENV: 'dev' },
    env_production: { NODE_ENV: 'production' }
  }
]};
