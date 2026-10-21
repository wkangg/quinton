import { InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import type { CommandConfig, CommandModule } from '../types.ts';

export const config = {
    name: 'year',
    description: 'Sends the year',
    enabled: true,
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel
    ],
    integration_types: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall
    ]
} satisfies CommandConfig;

export const execute: CommandModule['execute'] = async (_client, interaction) => {
    const year = new Date().getFullYear();
    return interaction.reply({ content: `The current year is ${year}.` });
};