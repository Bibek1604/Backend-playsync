import pino from 'pino';

const inDev=process.env.NODE_ENV !== 'production';

const logger = pino({
    level: inDev ? 'debug' : 'info',
    transport: inDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
            },
        }
        : undefined,
        redact: ['password', 'token', 'secret'],

});

export default logger;