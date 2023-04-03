const { Client, GatewayIntentBits, Partials, InteractionType, ActivityType } = require('discord.js');
const { Routes} = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const { discord_id, discord_token, channelsID, dev } = require('../../json/config.json');
const { commands } = require('../globals/commands.json');
const { Scorer } = require('../functions/Scorer');
const { RoleGiverManager } = require('../functions/RoleGiverManager');
const { ReportManager } = require('../functions/ReportManager');
const { PostManager } = require('../functions/PostManager');
//const { DBManager } = require('../util/DBManager');
const { CommandProcessor } = require('./CommandProcessor');
const { ModalProcessor } = require('./ModalProcessor');
const { MessageProcessor } = require('./MessageProcessor');
const { ContextProcessor } = require('./ContextProcessor');
const { BackupService } = require('../service/BackupService');

class VouchBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
      ],
      partials: [Partials.Channel]
    });

    // client application ready up
    this.client.on('ready', () => {
      this.buildDependencies();
      this.buildSlashCommands(); // client.application is null until client is ready
      this.updatePresence();
      console.log(`[${new Date().toLocaleString()}] bot is ready`); 
    });

    // handles incoming messages
    this.client.on('messageCreate', message => {  // recent change yung messageCreate
      this.msgproc.processMessage(message, this.client.user.id, this.scorer, this.rolegivermngr);
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
    //this.dbmngr = new DBManager();
    this.rolegivermngr = new RoleGiverManager(this.client);
    this.scorer = new Scorer(); // removed this.dbmngr arg
    this.reportmngr = new ReportManager(this.client);
    this.postmngr = new PostManager(this.client);
    this.cmdproc = new CommandProcessor();
    this.modalproc = new ModalProcessor();
    this.msgproc = new MessageProcessor();
    this.contextproc = new ContextProcessor();
    this.backupservice = new BackupService(this.client);
  }

  /**
   * builds the commands to be avaialble in the guild. mostly based on the discordjs guides
   */
  async buildSlashCommands(){
    const rest = new REST({ version: '10' }).setToken(discord_token);

    await rest.put(Routes.applicationGuildCommands(discord_id, channelsID.server), { body: commands })
      .then((data) => console.log(`[${new Date().toLocaleString()}] Successfully registered ${data.length} application commands.`))
      .catch(console.error);
  }

  /**
   * updates bot presence
   */
  async updatePresence(){
    let presence = {
      activities:[{
        type: ActivityType.Playing,
        url: "https://github.com/cryzereye/keebot-js",
        state: "https://github.com/cryzereye/keebot-js"
      }],
      status : "online"
    }
    presence.activities[0].name = "ping @gego for bugs";
    this.client.user.setPresence({
      activities: presence.activities,
      status: presence.status
    });
  }
}

module.exports = { VouchBot }