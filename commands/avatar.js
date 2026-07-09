import { ApplicationCommandOptionType } from 'discord.js';

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
    ]
};

export const execute = async (client, interaction) => {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const url = user.displayAvatarURL({ size: 4096 });

    interaction.reply({ content: url });
};