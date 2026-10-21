import { ApplicationCommandOptionType, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import type { CommandConfig, CommandModule } from '../types.ts';

export const config = {
    name: 'avatar',
    description: "Sends a user's profile picture URL.",
    enabled: true,
    options: [
        {
            name: 'user',
            description: 'The user to get the profile picture for.',
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
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
    const user = interaction.options.getUser('user') ?? interaction.user;
    const url = user.displayAvatarURL({ size: 4096 });

    return interaction.reply({ content: url });
};