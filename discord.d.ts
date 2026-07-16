import 'discord.js';

declare module 'discord.js' {
    interface ClientApplication {
        team?: Team
    }
}