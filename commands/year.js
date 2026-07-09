import { InteractionContextType } from 'discord.js';

export const config = {
    name: 'year',
    description: 'Sends the year',
    enabled: true,
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel
    ]
};

export const execute = async (client, interaction) => {
    const year = new Date().getFullYear();
    interaction.reply({ content: `The current year is ${year}.` });
};