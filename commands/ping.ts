import { EmbedBuilder, InteractionContextType } from 'discord.js';
import type { CommandConfig, CommandModule } from '../types.ts';
import { randomItem, require } from '../util/Util.ts';
const options = require('../assets/ping.json') as string[];

export const config = {
    name: 'ping',
    description: "Checks the bot's latency",
    enabled: true,
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel
    ]
} satisfies CommandConfig;

export const execute: CommandModule['execute'] = async (client, interaction) =>
    interaction
        .reply({ embeds: [
            new EmbedBuilder().setColor('#FFFFFF').setTitle('Pong!')
        ] })
        .then(() => interaction.editReply({ embeds: [
            new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle(randomItem(options))
                .setDescription(`${Date.now() - interaction.createdTimestamp}ms\nAPI Latency: ${client.ws.ping}ms`)
        ] }));