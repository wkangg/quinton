import { InteractionContextType } from 'discord.js';

export const config = {
    name: 'isittuesday',
    description: 'Determines if today is Tuesday',
    enabled: true,
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel
    ]
};

export const execute = async (client, interaction) => interaction.reply(`Today **is${new Date().getDay() === 2 ? '' : ' not'}** Tuesday.`);