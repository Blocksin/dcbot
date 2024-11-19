const { SlashCommandBuilder } = require('@discordjs/builders');

// Handle command
exports.run = async (client, interaction) => {
  await client.emit('guildMemberAdd', interaction.member);

  await interaction.reply({
    content: 'Emitted guild member added event',
    ephemeral: true,
  });
};

// Register command
const cmd = new SlashCommandBuilder()
  .setName('emit')
  .setDescription('Emit an event')
  .setDMPermission(false)
  .setDefaultMemberPermissions(8)
  .addSubcommand((subcommand) =>
    subcommand
      .setName('guildmemberadd')
      .setDescription('Emit a guild member added event')
  );

exports.data = cmd.toJSON();
