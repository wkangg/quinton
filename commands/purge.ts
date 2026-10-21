import { ApplicationCommandOptionType, PermissionsBitField, InteractionContextType, MessageFlags } from 'discord.js';
import type { CommandConfig, CommandModule } from '../types.ts';

export const config = {
    name: 'purge',
    description: 'Deletes the specified amount of messages.',
    enabled: true,
    default_member_permissions: PermissionsBitField.Flags.ManageMessages.toString(),
    options: [
        {
            name: 'amount',
            description: 'The amount of messages to delete.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
            min_value: 1,
            max_value: 100
        },
        {
            name: 'user',
            description: 'The user to delete messages from.',
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    contexts: [
        InteractionContextType.Guild
    ]
} satisfies CommandConfig;

export const execute: CommandModule['execute'] = async (_client, interaction) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.appPermissions.has([PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ReadMessageHistory]))
        return interaction.editReply('I need the **MANAGE MESSAGES** and **READ MESSAGE HISTORY** permissions in this channel');

    const channel = interaction.channel;
    if (!channel?.isTextBased() || channel.isDMBased())
        return interaction.editReply('This command can only be used in server text channels');

    // getUser rather than getMember: a member who left the server resolves to null, which would purge everyone
    const user = interaction.options.getUser('user');
    const messages = await channel.messages.fetch({ limit: 100 });
    const messageIds = (user ? messages.filter(message => message.author.id === user.id) : messages)
        .firstKey(interaction.options.getInteger('amount', true));
    const deleted = await channel.bulkDelete(messageIds, true);

    return interaction.editReply(`Deleted ${deleted.size} message${deleted.size === 1 ? '' : 's'}`);
};