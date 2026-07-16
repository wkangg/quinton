import { readdir } from 'node:fs';
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

readdir('./events/', async (error, files) => {
    if (error) {
        logger.error(error.stack ?? error.message);
        return;
    }
    logger.log(`Loading a total of ${files.length} events.`);
    for (const file of files) {
        if (!file.endsWith('.ts'))
            return logger.warn(`File not ending with .ts found in events folder: ${file}`);
        const eventName = file.split('.', 1)[0]!;
        logger.log(`Loading Event: ${eventName}. 👌`);
        const event = await import(`./events/${file}`) as { default: (client: BotClient, ...arguments_: unknown[]) => unknown };
        // Bind the client to any event, before the existing arguments provided by the discord.js event
        client.on(eventName, event.default.bind(undefined, client));
    }
});

readdir('./commands/', async (error, files) => {
    if (error) {
        logger.error(error.stack ?? error.message);
        return;
    }
    logger.log(`Loading a total of ${files.length} commands.`);

    for (const file of files) {
        if (!file.endsWith('.ts'))
            return logger.warn(`File not ending with .ts found in commands folder: ${file}`);

        const command = await import(`./commands/${file}`) as CommandModule;

        if (command.config.enabled !== true)
            return logger.warn(`${command.config.name} is disabled.`);
        if (!command.config)
            return logger.warn(`${command} failed to load as it is missing required command configuration`);
        logger.log(`Loading Command: ${command.config.name}. 👌`);
        if (command.config.name !== file.split('.', 1)[0])
            return logger.warn(`File name ${command} has a different command name ${command.config.name}`);

        client.commands.set(command.config.name, command);
    }
});

await client.login(process.env.token);

process.on('uncaughtException', error => client.logger.error(`UNCAUGHT EXCEPTION:\n${error.stack ?? error}`));
process.on('unhandledRejection', error => client.logger.error(`UNHANDLED REJECTION:\n${error instanceof Error ? error.stack ?? error : String(error)}`));