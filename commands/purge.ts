import { ApplicationCommandOptionType, PermissionsBitField, InteractionContextType, MessageFlags } from 'discord.js';
import type { GuildMember, TextChannel } from 'discord.js';
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

    const me = interaction.guild!.members.me ?? await interaction.guild!.members.fetchMe();

    if (!me.permissions.has(PermissionsBitField.Flags.ManageMessages))
        return interaction.editReply("I don't have the permission **MANAGE MESSAGES**");
    const channel = interaction.channel as TextChannel;
    return channel.messages
        .fetch({ limit: 100 })
        .then(messages => {
            const member = interaction.options.getMember('user') as GuildMember | null;
            const messageIds = (member
                ? messages.filter(message => message.author.id === member.id)
                : messages)
                .keys()
                .toArray()
                .slice(0, interaction.options.getInteger('amount')!);
            return channel.bulkDelete(messageIds, true);
        })
        .then(messages => interaction.editReply({ content: `Deleted ${messages.size} messages`, flags: MessageFlags.Ephemeral } as never));
};