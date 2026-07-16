import { InteractionContextType } from 'discord.js';
import type { CommandConfig, CommandModule } from '../types.ts';

export const config = {
    name: 'year',
    description: 'Sends the year',
    enabled: true,
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel
    ]
} satisfies CommandConfig;

export const execute: CommandModule['execute'] = async (_client, interaction) => {
    const year = new Date().getFullYear();
    interaction.reply({ content: `The current year is ${year}.` });
};