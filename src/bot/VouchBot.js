const { Client, Intents} = require('discord.js');
const { Routes} = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const { discord_id, discord_token, command_sign, me_id, verifyCHID, botCHID, testCHID, dev, serverID, commands } = require('../json/config.json');
const { Scorer } = require('../score/Scorer');
const { RoleGiverManager } = require('../role/RoleGiverManager');
const { DBManager } = require('../util/DBManager');
const { SlashCommandManager } = require('./SlashCommandManager');
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
      this.msgproc.processMessage(message, this.scorer);
    });

    // handles usage of slash commands
    this.client.on('interactionCreate', async interaction => {
      if (!interaction.isCommand()) return;
      this.commandmngr.processCommand(interaction, this.scorer, this.rolegivermngr);
    });
    
    this.client.login(discord_token);
  }

  sendMessageTo(chid, message) {
    let server = this.client.guilds.cache.find((g) => g.id == serverID);
    server.channels.fetch(chid).then((ch) => {
      ch.send(message).then(
        console.log(`${message} sent to #${ch.name}`)
      ).catch(console.error);
    }).catch(console.error);
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
    this.commandmngr = new SlashCommandManager();
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