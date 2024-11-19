const Discord = require('discord.js');
const config = require('./config.js');
const client = new Discord.Client({
  intents: [
    'DirectMessageTyping',
    'DirectMessages',
    'GuildBans',
    'GuildEmojisAndStickers',
    'GuildMembers',
    'GuildMessageTyping',
    'GuildMessages',
    'GuildPresences',
    'Guilds',
    'MessageContent',
  ],
});
const fs = require('fs');
const api = require('./libs/axios.js');
const logger = require('./utils/logger.js');
const userData = require('./utils/userData.js');

// Handle uncaught exceptions
process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

client.on('debug', (log) => {
  logger(log);
});

// Access to client
client.login(config.botToken);

// Initialize bot
client.on('ready', async () => {
  console.log(`BOT: Logged in as ${client.user.username}`);

  // Set status
  client.user.setStatus('dnd');
  client.user.setActivity('blocksin.net');

  // Initialize User Data
  userData.init();

  // Load Settings
  client.settings = await api.getSettings();

  // Get guild
  client.guild = client.guilds.cache.get(client.settings.guildID);
  if (!client.guild || client.guild === undefined) {
    console.log('BOT: Guild not found.');
  }

  // Load Modules
  const modules = [
    {
      name: 'roleSyncing',
      status: client.settings.roleSyncingStatus,
    },
    {
      name: 'support',
      status: client.settings.ticketStatus,
    },
  ];
  console.log(`BOT: Loading ${modules.length} modules.`);
  let moduleCount = 0;
  modules.map((module) => {
    if (!module.status) return;

    moduleCount++;
    require(`./modules/${module.name}.js`)(client);
  });
  console.log(`BOT: ${moduleCount} modules loaded.`);

  // Load Commands
  const commands = [];
  client.commands = new Discord.Collection();

  const commandFiles = fs
    .readdirSync(`${__dirname}/commands`)
    .filter((file) => file.endsWith('.js'));
  console.log(`BOT: Loading ${commandFiles.length} commands.`);

  commandFiles.map((file) => {
    const cmd = require(`./commands/${file}`);
    client.commands.set(cmd.data.name, cmd);
    commands.push(cmd.data);
  });
  const rest = new Discord.REST({ version: '9' }).setToken(config.botToken);
  rest
    .put(Discord.Routes.applicationCommands(client.user.id), { body: commands })
    .then(() => {
      console.log(`BOT: ${commandFiles.length} commands loaded.`);
    });
});

// Command Handler
client.on('interactionCreate', async (interaction) => {
  if (
    !interaction.isCommand() ||
    !interaction.channel ||
    interaction.channel.type === 'DM'
  )
    return;

  const command = interaction.commandName;
  const cmd = client.commands.get(command);

  if (cmd) {
    cmd.run(client, interaction);
  }
});

// Welcome message

const welcomeEmbed = new Discord.EmbedBuilder()
  .setTitle("Thank you for joining")
  .setDescription("📋 Please read our rules and information before continuing on to the server.\n\nBlocksin is a Minecraft PvP community based on 1.7-1.8. You can join the server at blocksin.net.\n\n🛒 You can visit our website at https://blocksin.net/ or our store at https://blocksin.net/store /n/nIf you require any support head over to ⁠BlockSin Community⁠❓┃faq or ⁠BlockSin Community⁠🩹┃support if you require further assistance.")
  .setColor(0x1C6FEB)
  .setImage("https://media.discordapp.net/attachments/1298923346070736938/1307810381934366942/standard.gif?ex=673cfa54&is=673ba8d4&hm=86be666c8a1c4ae4efcead1153b59c8ccee3c11cd33692430b26c52cf7986bdd&=&width=750&height=300")
  .setFooter({
    text: "Joined",
  })
  .setTimestamp();

client.on('guildMemberAdd', async (interaction) => {
  if (!config.welcomeChannelID) return;

  try {
    let welcomeChannel = await client.channels.fetch(config.welcomeChannelID);

    if (welcomeChannel.lastMessage && welcomeChannel.lastMessage.mentions.has(interaction.user)) { return; }

    welcomeChannel.send({ content: `Welcome to Blocksin, ${interaction.user}!`, embeds: [welcomeEmbed] })
      .catch(error => {
        console.error('BOT: Failed to send welcome message:', error);
      });

  } catch (error) {
    console.error('BOT: Failed to fetch welcome channel:', error);
  }
});