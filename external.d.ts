declare module '@william5553/translate-google-api' {
    export type Translation = {
        text: string
        from: {
            language: {
                iso: string
            }
        }
    };

    export const langs: Record<string, string>;

    export function getCode(language?: string | null): string | undefined;

    export function isSupported(language: string): boolean;

    export function translate(
        text: string,
        options?: {
            from?: string | null
            to?: string | null
        }
    ): Promise<Translation>;
}