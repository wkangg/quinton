import { ApplicationCommandOptionType, EmbedBuilder, InteractionContextType } from 'discord.js';
import type { CommandConfig, CommandModule } from '../types.ts';
import { clamp } from '../util/Util.ts';

type UrbanDictionaryResponse = {
    list: Array<{
        author: string
        definition: string
        example: string
        permalink: string
        thumbs_down: number
        thumbs_up: number
        word: string
        written_on: string
    }>
};

export const config = {
    name: 'urbandictionary',
    description: 'Searches for a term on the Urban Dictionary.',
    enabled: true,
    options: [
        {
            name: 'query',
            description: 'The text to search.',
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

    return fetch(`https://api.urbandictionary.com/v0/define?term=${query}`)
        .then(response => response.json() as Promise<UrbanDictionaryResponse>)
        .then(body => {
            if (body.list.length === 0) return interaction.editReply('Could not find any results');

            const data = body.list[result ? clamp(result - 1, 0, body.list.length - 1) : 0]!;

            return interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setColor(0x32_A8_F0)
                    .setAuthor({ name: 'Urban Dictionary', iconURL: 'https://i.imgur.com/Fo0nRTe.png', url: data.permalink })
                    .setURL(data.permalink)
                    .setTitle(data.word)
                    .setDescription(data.definition.slice(0, 1200))
                    .setFooter({ text: `Author: ${data.author} | 👍 ${data.thumbs_up} 👎 ${data.thumbs_down}` })
                    .setTimestamp(new Date(data.written_on))
                    .addFields([{ name: 'Example', value: data.example ? data.example.slice(0, 800) : 'None' }])
            ] });
        });
};