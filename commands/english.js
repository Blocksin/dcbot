const Discord = require('discord.js');
const translate = require('google-translate-api-x');

// Handle command
exports.run = async (client, interaction) => {
    await interaction.deferReply({ephemeral: true});

    const message = interaction.targetMessage;

    let res = await translate(message.content, {to: 'en'});

    interaction.editReply({ content: res.text})
        .catch(error => {
            console.error('BOT: Failed to send welcome message:', error);
        });
};

// Register command
const cmd = new Discord.ContextMenuCommandBuilder()
  .setName('Translate to English')
  .setType(Discord.ApplicationCommandType.Message)
  .setDMPermission(false);

exports.data = cmd.toJSON();
