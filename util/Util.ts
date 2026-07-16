import { createRequire } from 'node:module';

export { setTimeout as wait } from 'node:timers/promises';
export const randomItem = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)]!;
export const require = createRequire(import.meta.url);
export const clamp = (number: number, minimum: number, maximum: number): number => Math.min(Math.max(number, minimum), maximum);

type SplitMessageOptions = {
    append?: string
    char?: string
    maxLength?: number
    prepend?: string
};

export const splitMessage = (content: string, options: SplitMessageOptions = {}): string[] => {
    const maxLength = options.maxLength ?? 2000;
    if (content.length <= maxLength) return [content];

    const character = options.char ?? '\n';
    const prepend = options.prepend ?? '';
    const append = options.append ?? '';
    const splitText = content.split(character);
    if (splitText.some(piece => piece.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');

    const messages = [];
    let message = '';
    for (const piece of splitText) {
        if (message && (message + character + piece + append).length > maxLength) {
            messages.push(prepend + message + append);
            message = '';
        }
        message += (message && piece !== '' ? character : '') + piece;
    }

    return [...messages, prepend + message + append];
};