const Discord = require('discord.js');

// Handle command
exports.run = async (client, interaction) => {

  await client.emit('guildMemberAdd', interaction.member);
  
  interaction.reply({
    content: 'Emited guild member added event',
    ephemeral: false
  });
};

// Register command
const cmd = new Discord.SlashCommandBuilder()
  .setName('emit')
  .setDescription('Emit an event')
  .setDMPermission(false)
  .setDefaultMemberPermissions(8)
  .addSubcommand(
    new Discord.SlashCommandSubcommandBuilder()
      .setName('guildMemberAdd')
      .setDescription("Emit a guild member added event")
  );

exports.data = cmd.toJSON();
