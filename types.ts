import type { ChatInputCommandInteraction, Client, Collection, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import type * as logger from './util/logger.ts';

export type CommandConfig = RESTPostAPIChatInputApplicationCommandsJSONBody & {
    enabled: boolean
};

export type CommandModule = {
    config: CommandConfig
    execute(client: BotClient, interaction: ChatInputCommandInteraction): Promise<unknown>
};

export type BotClient = Client & {
    commands: Collection<string, CommandModule>
    logger: typeof logger
    owners: string[]
};