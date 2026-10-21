import { readdir } from 'node:fs/promises';
import { ActivityType, Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import type { BotClient, CommandModule } from './types.ts';
import * as logger from './util/logger.ts';

const client = new Client({
    intents: (Object.values(GatewayIntentBits) as number[]).reduce((accumulator, permission) => accumulator | permission, 0) ?? 32_767,
    partials: [Partials.Channel],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
    waitGuildTimeout: 5000,
    presence: {
        status: 'online',
        activities: [{
            name: '/isittuesday',
            type: ActivityType.Listening
        }]
    }
}) as BotClient;

client.owners = [];
client.commands = new Collection();
client.logger = logger;

process.on('uncaughtException', error => logger.error(`UNCAUGHT EXCEPTION:\n${error.stack ?? error}`));
process.on('unhandledRejection', error => logger.error(`UNHANDLED REJECTION:\n${error instanceof Error ? error.stack ?? error : String(error)}`));

const eventFiles = await readdir('./events/');
logger.log(`Loading a total of ${eventFiles.length} events.`);

for (const file of eventFiles) {
    if (!file.endsWith('.ts')) {
        logger.warn(`File not ending with .ts found in events folder: ${file}`);
        continue;
    }
    const eventName = file.split('.', 1)[0]!;
    logger.log(`Loading Event: ${eventName}. 👌`);
    const event = await import(`./events/${file}`) as { default: (client: BotClient, ...arguments_: unknown[]) => unknown };
    // Bind the client to any event, before the existing arguments provided by the discord.js event
    client.on(eventName, event.default.bind(undefined, client));
}

const commandFiles = await readdir('./commands/');
logger.log(`Loading a total of ${commandFiles.length} commands.`);

for (const file of commandFiles) {
    if (!file.endsWith('.ts')) {
        logger.warn(`File not ending with .ts found in commands folder: ${file}`);
        continue;
    }

    const command = await import(`./commands/${file}`) as CommandModule;

    if (!command.config) {
        logger.warn(`${file} failed to load as it is missing required command configuration`);
        continue;
    }
    if (command.config.enabled !== true) {
        logger.warn(`${command.config.name} is disabled.`);
        continue;
    }
    if (command.config.name !== file.split('.', 1)[0]) {
        logger.warn(`File name ${file} has a different command name ${command.config.name}`);
        continue;
    }
    logger.log(`Loading Command: ${command.config.name}. 👌`);

    client.commands.set(command.config.name, command);
}

await client.login(process.env.token);