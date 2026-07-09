import { ApplicationCommandOptionType } from 'discord.js';

const wordleStart = Date.UTC(2021, 5, 19);
const day = 86_400_000;
const wordleApiBase = 'https://www.nytimes.com/svc/wordle/v2';

const formatDate = date => date.toISOString().slice(0, 10);

const yesterday = () => {
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

const dateFromWordleNumber = number => new Date(wordleStart + (number - 1) * day);

const wordleNumberFromDate = date => Math.floor((date.getTime() - wordleStart) / day) + 1;

const fetchWordle = async date => {
    const response = await fetch(`${wordleApiBase}/${formatDate(date)}.json`);

    if (!response.ok)
        throw new Error(`NYT returned ${response.status} for ${formatDate(date)}`);

    return response.json();
};

const wordleNumberFromData = (data, date) =>
    Number.isSafeInteger(data.days_since_launch) ? data.days_since_launch + 1 : wordleNumberFromDate(date);

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
    ]
};

export const execute = async (client, interaction) => {
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