export const config = {
    name: 'year',
    description: 'Sends the year',
    enabled: true
};

export const execute = async (client, interaction) => {
    const year = new Date().getFullYear();
    interaction.reply({ content: `The current year is ${year}.` });
};