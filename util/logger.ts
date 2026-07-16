import { inspect, styleText } from 'node:util';

export const log = (content: unknown, type: 'log' | 'warn' | 'error' | 'debug' | 'ready' = 'log') => {
    const message = typeof content === 'string' ? content : inspect(content, { depth: 2 });

    switch (type) {
        case 'log':
            return console.log(`${styleText('bgBlue', type.toUpperCase())} ${message}`);

        case 'warn':
            return console.log(`${styleText(['black', 'bgYellow'], type.toUpperCase())} ${message}`);

        case 'error':
            return console.error(`${styleText('bgRed', type.toUpperCase())} ${message}`);

        case 'debug':
            if (process.env.NODE_ENV === 'production') return;
            return console.log(`${styleText('green', type.toUpperCase())} ${message}`);

        case 'ready':
            return console.log(`${styleText(['black', 'bgGreen'], type.toUpperCase())} ${message}`);

        default:
            throw new TypeError('Logger type must be either warn, debug, log, ready, or error.');
    }
};

export const error = (content: unknown) => log(content, 'error');
export const warn = (content: unknown) => log(content, 'warn');
export const debug = (content: unknown) => log(content, 'debug');
export default {
    log,
    error,
    warn,
    debug
};