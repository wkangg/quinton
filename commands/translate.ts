import { ApplicationCommandOptionType, EmbedBuilder, InteractionContextType } from 'discord.js';
import { translate, isSupported, langs, getCode } from '@william5553/translate-google-api';
import type { CommandConfig, CommandModule } from '../types.ts';

const getLanguageName = (code: string | undefined) => Object.entries(langs).find(([, languageCode]) => languageCode === code)?.[0] ?? code ?? 'Unknown';

export const config = {
    name: 'translate',
    description: 'Translates text to another language using Google Translate.',
    enabled: true,
    options: [
        {
            name: 'text',
            description: 'The text to translate.',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'to',
            description: 'The language to translate to.',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'from',
            description: 'The language to translate from.',
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel
    ]
} satisfies CommandConfig; // TODO: https://discordjs.guide/slash-commands/autocomplete.html#enabling-autocomplete

export const execute: CommandModule['execute'] = async (_client, interaction) => {
    const text = interaction.options.getString('text', true);
    const from = interaction.options.getString('from');
    const to = interaction.options.getString('to');

    if (from && !isSupported(from)) return interaction.reply(`${from} isn't a supported language`);
    if (to && !isSupported(to)) return interaction.reply(`${to} isn't a supported language`);

    await interaction.deferReply();
    const targetLanguageName = getLanguageName(getCode(to ?? 'en'));

    return translate(text, {
        ...from && { from },
        ...to && { to }
    })
        .then(result =>
            interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setColor(0x53_90_F5)
                    .setTitle('Translation')
                    .addFields(
                        { name: '**Input**', value: text, inline: true },
                        { name: '**Text**', value: result.text, inline: true },
                        { name: '\n', value: '\n' },
                        { name: '**From**', value: getLanguageName(result.from.language.iso), inline: true },
                        { name: '**To**', value: targetLanguageName, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Powered by Google Translate', iconURL: 'https://www.gstatic.com/images/branding/product/1x/translate_96dp.png' })
            ] })
        );
};