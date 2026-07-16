import { inspect, styleText } from 'node:util';

export const log = (content: string, type: 'log' | 'warn' | 'error' | 'debug' | 'ready' = 'log') => {
    if (typeof content !== 'string')
        content = inspect(content, { depth: 2 });

    switch (type) {
        case 'log':
            return console.log(`${styleText('bgBlue', type.toUpperCase())} ${content}`);

        case 'warn':
            return console.log(`${styleText(['black', 'bgYellow'], type.toUpperCase())} ${content}`);

        case 'error':
            return console.error(`${styleText('bgRed', type.toUpperCase())} ${content}`);

        case 'debug':
            if (process.env.NODE_ENV === 'production') return;
            return console.log(`${styleText('green', type.toUpperCase())} ${content}`);

        case 'ready':
            return console.log(`${styleText(['black', 'bgGreen'], type.toUpperCase())} ${content}`);

        default:
            throw new TypeError('Logger type must be either warn, debug, log, ready, or error.');
    }
};

export const error = (content: string) => log(content, 'error');
export const warn = (content: string) => log(content, 'warn');
export const debug = (content: string) => log(content, 'debug');
export default {
    log,
    error,
    warn,
    debug
};