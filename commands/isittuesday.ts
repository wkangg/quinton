import { InteractionContextType } from 'discord.js';
import type { CommandConfig, CommandModule } from '../types.ts';

export const config = {
    name: 'isittuesday',
    description: 'Determines if today is Tuesday',
    enabled: true,
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel
    ]
} satisfies CommandConfig;

export const execute: CommandModule['execute'] = async (_client, interaction) => interaction.reply(`Today **is${new Date().getDay() === 2 ? '' : ' not'}** Tuesday.`);