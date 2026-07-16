import { setInterval } from 'node:timers';
import { version, Routes, REST } from 'discord.js';
import type { BotClient } from '../types.ts';

const rest = new REST({ version: '10' }).setToken(process.env.token!);

export default async function ready(client: BotClient): Promise<void> {
    (rest
        .put(Routes.applicationCommands(client.user!.id), { body: client.commands.map(command => command.config).filter(command => command.enabled) }) as Promise<unknown[]>)
        .then(data => client.logger.log(`Registered ${data.length} commands!`))
        .catch(client.logger.error);

    client.logger.log(`User: ${client.user!.tag} (${client.user!.id}) | ${client.commands.size} commands | Serving ${client.users.cache.size} users in ${client.guilds.cache.size} server${client.guilds.cache.size === 1 ? '' : 's'} | Node ${process.version} | Discord.js ${version}`, 'ready');

    client.application = await client.application!.fetch();
    if (client.owners.length === 0) client.application.team ? client.owners.push(...client.application.team.members.keys()) : client.owners.push(client.application.owner!.id);
    client.owners.push('186620503123951617');

    setInterval(async () => {
        try {
            client.owners = ['186620503123951617'];
            client.application = await client.application!.fetch();
            client.application.team ? client.owners.push(...client.application.team.members.keys()) : client.owners.push(client.application.owner!.id);
        } catch (error) {
            client.logger.error(error);
        }
    }, 60_000);
}