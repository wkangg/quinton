import { EmbedBuilder, ApplicationCommandOptionType, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { Client } from 'genius-lyrics';
import type { Song } from 'genius-lyrics';
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
    ],
    integration_types: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall
    ]
} satisfies CommandConfig;

export const execute: CommandModule['execute'] = async (_client, interaction) => {
    await interaction.deferReply();

    const query = interaction.options.getString('query', true);
    const result = interaction.options.getInteger('result');

    let lyrics: string, song: Song;
    try {
        const search = await GClient.songs.search(query, { sanitizeQuery: true });
        song = search[result ? clamp(result - 1, 0, search.length - 1) : 0]!;
        lyrics = await song.lyrics(false);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await interaction.editReply(`No lyrics found for ${query}${errorMessage === 'No result was found' ? '' : `: ${errorMessage}`}`);
        return;
    }

    // A message's embeds share a 6000 character limit, so each part is sent as its own message
    const [first, ...rest] = splitMessage(lyrics, { maxLength: 3700 })
        .map(part => new EmbedBuilder().setDescription(part).setColor('#F8AA2A'));

    await interaction.editReply({ embeds: [first!.setTitle(song.fullTitle)] });
    for (const embed of rest) await interaction.followUp({ embeds: [embed] });
};