import { EmbedBuilder, MessageFlags } from 'discord.js';
import type { Interaction } from 'discord.js';
import type { BotClient } from '../types.ts';

export default async function interactionCreate(client: BotClient, interaction: Interaction): Promise<unknown> {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(client, interaction);
        return;
    } catch (error) {
        client.logger.error(error.stack ?? error);

        const options = { embeds: [
            new EmbedBuilder()
                .setColor('#FF0000')
                .setTimestamp()
                .setTitle('Please report this on GitHub')
                .setURL('https://github.com/wkangg/quinton/issues')
                .addFields(
                    { name: '**Command**', value: interaction.commandName, inline: true },
                    { name: '**Options**', value: JSON.stringify(interaction.options.data, null, 2) }
                )
                .setDescription(`**Stack Trace:**\n\`\`\`${error.stack ?? error}\`\`\``)
        ] };

        return interaction.deferred
            ? interaction.editReply(options)
            : interaction.reply({ ...options, flags: MessageFlags.Ephemeral });
    }
}