const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { Routes, InteractionType} = require('discord-api-types/v10');
const { REST } = require('@discordjs/rest');
const { discord_id, discord_token, channelsID, dev } = require('../json/config.json');
const { commands } = require('../globals/commands.json');
const { Scorer } = require('../functions/Scorer');
const { RoleGiverManager } = require('../functions/RoleGiverManager');
const { ReportManager } = require('../functions/ReportManager');
const { DBManager } = require('../util/DBManager');
const { CommandProcessor } = require('./CommandProcessor');
const { ModalProcessor } = require('./ModalProcessor');
const { MessageProcessor } = require('./MessageProcessor');
const { ContextProcessor } = require('./ContextProcessor');

class VouchBot {
  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
      partials: [Partials.Channel]
    });

    // client application ready up
    this.client.on('ready', () => {
      this.buildDependencies();
      this.buildSlashCommands(); // client.application is null until client is ready
      this.updatePresence();
      console.log("bot is ready"); 
    });

    // handles incoming messages
    this.client.on('messageCreate', message => {  // recent change yung messageCreate
      this.msgproc.processMessage(message, this.client.user.id, this.scorer, this.rolegivermngr);
    });

    // handles deleted messages
    this.client.on('messageDelete', message => {  // recent change yung messageCreate
      this.msgproc.processDeleteMessage(message);
    });

    // handles usage of slash commands
    this.client.on('interactionCreate', async interaction => {
      if (interaction.isContextMenuCommand())
        this.contextproc.processContext(interaction, this.postmngr, this.reportmngr);
      else if (interaction.type === InteractionType.ApplicationCommand)
        this.cmdproc.processCommand(interaction, this.scorer, this.rolegivermngr, this.reportmngr, this.postmngr);
      else if (interaction.type === InteractionType.ModalSubmit)
        this.modalproc.processModal(interaction, this.postmngr);
      else
        return;
    });
    
    this.client.login(discord_token);
  }

  /**
   * builds all classes that would do the jobs for the bot
   */
  buildDependencies(){
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
      partials: [Partials.Channel]
    });
    this.dbmngr = new DBManager();
    this.rolegivermngr = new RoleGiverManager(this.client);
    this.scorer = new Scorer(this.dbmngr);
    this.cmdproc = new CommandProcessor(this.client, this.dbmngr);
    this.msgproc = new MessageProcessor(this.dbmngr);
    this.reportmngr = new ReportManager();
  }

  /**
   * builds the commands to be avaialble in the guild. mostly based on the discordjs guides
   */
  async buildSlashCommands(){
    const rest = new REST({ version: '10' }).setToken(discord_token);

    await rest.put(Routes.applicationGuildCommands(discord_id, channelsID.server), { body: commands })
      .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
      .catch(console.error);
  }

  /**
   * updates bot presence
   */
  async updatePresence(){
    let status;
    let presence = {
      activities:[{
        type: "PLAYING",
        platform: "desktop",
        url: "https://github.com/cryzereye/vouch-bot-js"
      }]
    }
    
    if(dev){
      presence.activities[0].name = "IN DEVELOPMENT";
      status = "dnd";
    }
    else{
      presence.activities[0].name = "/help for more details";
      status = "online";
    }
    this.client.user.setPresence({
      activities: presence.activities,
      status: status
    });
  }
}

module.exports = { VouchBot }