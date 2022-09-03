const { Client, Intents} = require('discord.js');
const { Routes} = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const { discord_id, discord_token, serverID, commands } = require('../json/config.json');
const { Scorer } = require('../score/Scorer');
const { RoleGiverManager } = require('../role/RoleGiverManager');
const { DBManager } = require('../util/DBManager');
const { CommandProcessor } = require('./CommandProcessor');
const { MessageProcessor } = require('./MessageProcessor');

const fs = require('node:fs');

class VouchBot {
  constructor() {
    this.buildDependencies();
  
    // client application ready up
    this.client.on('ready', () => {
      this.buildSlashCommands(); // client.application is null until client is ready
      console.log("bot is ready");  
    });

    // handles incoming messages
    this.client.on('messageCreate', message => {  // recent change yung messageCreate
      this.msgproc.processMessage(message, this.client.user.id, this.scorer);
    });

    // handles usage of slash commands
    this.client.on('interactionCreate', async interaction => {
      if (!interaction.isCommand()) return;
      this.cmdproc.processCommand(interaction, this.scorer, this.rolegivermngr);
    });
    
    this.client.login(discord_token);
  }

  /**
   * builds all classes that would do the jobs for the bot
   */
  buildDependencies(){
    this.client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES, // required daw
      ]
    });
    this.dbmngr = new DBManager();
    this.rolegivermngr = new RoleGiverManager(this.client);
    this.scorer = new Scorer(this.dbmngr);
    this.cmdproc = new CommandProcessor();
    this.msgproc = new MessageProcessor();
  }

  /**
   * builds the commands to be avaialble in the guild. mostly based on the discordjs guides
   */
  async buildSlashCommands(){
    const rest = new REST({ version: '10' }).setToken(discord_token);

    await rest.put(Routes.applicationGuildCommands(discord_id, serverID), { body: commands })
      .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
      .catch(console.error);
  }
}

module.exports = { VouchBot }