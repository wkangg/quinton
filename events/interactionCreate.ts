import { EmbedBuilder, MessageFlags } from 'discord.js';
import type { Interaction } from 'discord.js';
import type { BotClient } from '../types.ts';

const truncate = (text: string, maxLength: number): string => text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;

export default async function interactionCreate(client: BotClient, interaction: Interaction): Promise<unknown> {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(client, interaction);
        return;
    } catch (error) {
        const stack = error instanceof Error ? error.stack ?? error.message : String(error);
        client.logger.error(stack);

        const options = { embeds: [
            new EmbedBuilder()
                .setColor('#FF0000')
                .setTimestamp()
                .setTitle('Please report this on GitHub')
                .setURL('https://github.com/wkangg/quinton/issues')
                .addFields(
                    { name: '**Command**', value: interaction.commandName, inline: true },
                    { name: '**Options**', value: truncate(JSON.stringify(interaction.options.data, null, 2), 1024) }
                )
                .setDescription(`**Stack Trace:**\n\`\`\`${truncate(stack, 3900)}\`\`\``)
        ] };

        return (interaction.deferred || interaction.replied
            ? interaction.editReply(options)
            : interaction.reply({ ...options, flags: MessageFlags.Ephemeral }))
            .catch(client.logger.error);
    }
}