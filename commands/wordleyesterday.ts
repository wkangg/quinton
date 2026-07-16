import { ApplicationCommandOptionType, InteractionContextType } from 'discord.js';
import type { CommandConfig, CommandModule } from '../types.ts';

type WordleData = {
    days_since_launch?: number
    solution?: string
};

const wordleStart = Date.UTC(2021, 5, 19);

const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

const yesterday = (): Date => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const parts = Object.fromEntries(formatter.formatToParts(new Date()).map(part => [part.type, part.value]));
    const year = Number(parts.year);
    const month = Number(parts.month);
    const date = Number(parts.day);

    return new Date(Date.UTC(year, month - 1, date - 1));
};

const dateFromWordleNumber = (number: number): Date => new Date(wordleStart + number * 86_400_000);
const wordleNumberFromDate = (date: Date): number => Math.floor((date.getTime() - wordleStart) / 86_400_000);

const fetchWordle = async (date: Date): Promise<WordleData> => {
    const response = await fetch(`https://www.nytimes.com/svc/wordle/v2/${formatDate(date)}.json`);

    if (!response.ok)
        throw new Error(`NYT returned ${response.status} for ${formatDate(date)}`);

    return response.json() as Promise<WordleData>;
};

const wordleNumberFromData = (data: WordleData, date: Date): number =>
    Number.isSafeInteger(data.days_since_launch) ? data.days_since_launch! : wordleNumberFromDate(date);

export const config = {
    name: 'wordleyesterday',
    description: "Sends yesterday's Wordle answer.",
    enabled: true,
    options: [
        {
            name: 'number',
            description: 'The Wordle puzzle number to look up instead.',
            type: ApplicationCommandOptionType.Integer,
            required: false,
            min_value: 1
        }
    ],
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel
    ]
} satisfies CommandConfig;

export const execute: CommandModule['execute'] = async (_client, interaction) => {
    await interaction.deferReply();

    const number = interaction.options.getInteger('number');
    const date = number ? dateFromWordleNumber(number) : yesterday();
    const today = yesterday();
    today.setUTCDate(today.getUTCDate() + 1);

    if (date >= today) {
        await interaction.editReply('That Wordle has not been released yet.');
        return;
    }

    const data = await fetchWordle(date);

    if (typeof data.solution !== 'string') {
        await interaction.editReply(`Could not find a Wordle answer for ${formatDate(date)}.`);
        return;
    }

    const wordleNumber = number ?? wordleNumberFromData(data, date);

    await interaction.editReply(`Wordle #${wordleNumber} (${formatDate(date)}): ||${data.solution.toUpperCase()}||`);
};