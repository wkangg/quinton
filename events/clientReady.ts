import { setInterval } from 'node:timers';
import { version, Routes, REST, Team } from 'discord.js';
import type { BotClient } from '../types.ts';

const rest = new REST({ version: '10' }).setToken(process.env.token!);

const BOT_AUTHOR_ID = '186620503123951617';

const refreshOwners = async (client: BotClient): Promise<void> => {
    const { owner } = await client.application!.fetch();
    client.owners = [BOT_AUTHOR_ID, ...owner instanceof Team ? owner.members.keys() : owner ? [owner.id] : []];
};

export default async function ready(client: BotClient): Promise<void> {
    (rest
        .put(Routes.applicationCommands(client.user!.id), { body: client.commands.map(command => command.config).filter(command => command.enabled) }) as Promise<unknown[]>)
        .then(data => client.logger.log(`Registered ${data.length} commands!`))
        .catch(client.logger.error);

    client.logger.log(`User: ${client.user!.tag} (${client.user!.id}) | ${client.commands.size} commands | Serving ${client.users.cache.size} users in ${client.guilds.cache.size} server${client.guilds.cache.size === 1 ? '' : 's'} | Node ${process.version} | Discord.js ${version}`, 'ready');

    await refreshOwners(client);

    setInterval(() => refreshOwners(client).catch(client.logger.error), 60_000);
}