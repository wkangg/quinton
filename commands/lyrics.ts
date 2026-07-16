import { EmbedBuilder, ApplicationCommandOptionType, InteractionContextType } from 'discord.js';
import { Client } from 'genius-lyrics';
import type { CommandConfig, CommandModule } from '../types.ts';
import { splitMessage, clamp } from '../util/Util.ts';

const GClient = new Client(process.env.genius_api_key);

export const config = {
    name: 'lyrics',
    description: 'Gets lyrics for a song',
    enabled: true,
    options: [
        {
            name: 'query',
            description: 'The song to get lyrics for.',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'result',
            description: 'The result number.',
            type: ApplicationCommandOptionType.Integer,
            required: false
        }
    ],
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel
    ]
} satisfies CommandConfig;

export const execute: CommandModule['execute'] = async (_client, interaction) => {
    await interaction.deferReply();

    const query = interaction.options.getString('query')!;
    const result = interaction.options.getInteger('result');

    let lyrics, song;
    try {
        const search = await GClient.songs.search(query, { sanitizeQuery: true });
        song = search[result ? clamp(result - 1, 0, search.length - 1) : 0]!;
        lyrics = await song.lyrics(false);
    } catch (error) {
        await interaction.editReply(`No lyrics found for ${query}${error.message === 'No result was found' ? '' : `: ${error.message ?? error}`}`);
        return 'No lyrics found';
    }

    const embeds = [];

    const lyricParts = splitMessage(lyrics, { maxLength: 3700 });
    for (const message of lyricParts) {
        if (embeds.length >= 10) continue;

        const embed = new EmbedBuilder()
            .setDescription(message)
            .setColor('#F8AA2A');

        if (embeds.length === 0)
            embed.setTitle(song.fullTitle);

        embeds.push(embed);
    }
    interaction.editReply({ embeds });
    return;
};