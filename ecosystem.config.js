module.exports = {
    apps: [
        {
            name: 'merchant-transactions',
            script: 'dist/main.js',
            instances: 1,
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'dev',
                PORT: 3001,
                PROVIDER: 'LOCAL',
                DB_HOST: 'localhost',
                DB_PORT: 5433,
                DB_USER: 'postgres',
                DB_PASSWORD: 'postgres',
                DB_DATABASE: 'transactions',
                ENV: 'DEV',
                ENABLE_SWAGGER: true
            }
        }
    ]
}