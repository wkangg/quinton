import { ApplicationCommandOptionType, EmbedBuilder, InteractionContextType } from 'discord.js';
import { translate, isSupported, langs, getCode } from '@william5553/translate-google-api';
import type { CommandConfig, CommandModule } from '../types.ts';

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
    if (interaction.options.getString('from') && !isSupported(interaction.options.getString('from')!)) return interaction.reply(`${interaction.options.getString('from')} isn't a supported language`);
    if (interaction.options.getString('to') && !isSupported(interaction.options.getString('to')!)) return interaction.reply(`${interaction.options.getString('to')} isn't a supported language`);

    await interaction.deferReply();

    return translate(interaction.options.getString('text')!, { from: interaction.options.getString('from'), to: interaction.options.getString('to') })
        .then(result =>
            interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setColor(0x53_90_F5)
                    .setTitle('Translation')
                    .addFields(
                        { name: '**Input**', value: interaction.options.getString('text')!, inline: true },
                        { name: '**Text**', value: result.text, inline: true },
                        { name: '\n', value: '\n' },
                        { name: '**From**', value: Object.keys(langs).find(key => langs[key] === result.from.language.iso)!, inline: true },
                        { name: '**To**', value: Object.keys(langs).find(key => langs[key] === getCode(interaction.options.getString('to') ?? 'en'))!, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Powered by Google Translate', iconURL: 'https://www.gstatic.com/images/branding/product/1x/translate_96dp.png' })
            ] })
        );
};