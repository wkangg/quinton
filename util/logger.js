import { inspect, styleText } from 'node:util';

export const log = (content, type = 'log') => {
    if (typeof content !== 'string')
        content = inspect(content, { depth: 2 });

    switch (type) {
        case 'log':
            return console.log(`${styleText('bgBlue', type.toUpperCase())} ${content}`);

        case 'warn':
            return console.log(`${styleText(['black', 'bgYellow'], type.toUpperCase())} ${content}`);

        case 'error':
            return console.log(`${styleText('bgRed', type.toUpperCase())} ${content}`);

        case 'debug':
            return console.log(`${styleText('green', type.toUpperCase())} ${content}`);

        case 'ready':
            return console.log(`${styleText(['black', 'bgGreen'], type.toUpperCase())} ${content}`);

        default:
            throw new TypeError('Logger type must be either warn, debug, log, ready, or error.');
    }
};

export const error = (...args) => log(...args, 'error');

export const warn = (...args) => log(...args, 'warn');

export const debug = (...args) => log(...args, 'debug');