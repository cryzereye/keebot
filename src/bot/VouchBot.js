const { Client, Intents } = require('discord.js');
const { discord_token, command_sign, me_id, verifyCHID, botCHID, testCHID, dev } = require('../json/config.json');
const { Scorer } = require('../score/Scorer');
const { MessageExtractor } = require('../util/MessageExtractor');
const { RoleGiverManager } = require('../role/RoleGiverManager');
const { DBManager } = require('../util/DBManager');

class VouchBot {
  constructor() {

    this.client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES, // required daw
      ]
    });
    this.dbmngr = new DBManager();
    this.rolegivermngr = new RoleGiverManager(this.client);
    this.scorer = new Scorer(this.dbmngr);

    // events detection
    this.client.on('ready', () => {
      this.sendMessageTo(botCHID);
      console.log(`Logged in as ${this.client.user.tag}!`);
    });

    this.client.on('messageCreate', message => {  // recent change yung messageCreate
      let msg = '';
      let authorID = message.author.id.toString();
      let authorName = message.author.username + '#' + message.author.discriminator;
      let messageCHID = message.channel.id;
      let currentlyTesting = (messageCHID == testCHID && dev);
      
      if (authorID === this.client.user.id) return; // if bot sent the message, ignore
      if (message.content.startsWith(command_sign + 'stats') && (messageCHID == botCHID && !dev || currentlyTesting)) {
        let count = 0;
        message.mentions.users.map(x => {
          msg = this.scorer.getStats(x.id);
          message.reply(msg);

          count++;
        });
        if (count == 0) {
          msg = this.scorer.getStats(authorID);
          message.reply(msg);
        }
      }
      else if (message.content.startsWith(command_sign + 'extract')) {
        console.log('Checking if admin...');
        if (authorID == me_id) { // commands from admin/me
          console.log('Data extraction from #verify-transactions starting...');
          let extractor = new MessageExtractor();
          extractor.extractAllMessages(message.channel, this.scorer, this.rolegivermngr);
          message.delete();
        }
      }
      else if (message.content.startsWith(command_sign + 'cleanroles')) { // tester for rolegiver
        if (authorID == me_id) { // commands from admin/me
          this.rolegivermngr.cleanRoleUsers(message, this.scorer);
          message.delete();
        }
      }
      else if (message.content.startsWith(command_sign + 'giverole') && dev) { // tester for rolegiver
        if (authorID == me_id) { // commands from admin/me
          this.rolegivermngr.roleCheck(10, message);
        }
      }
      else if (messageCHID == verifyCHID && !dev || currentlyTesting) { // only for vouch channel
        console.log("Processing vouch msg from " + authorName);
        // process all verifications
        // id1 sender, id2 mentioned

        // possible reply back, 1 instance
        if (message.type == 'REPLY') {
          let replyto = message.mentions.repliedUser.username + '#' + message.mentions.repliedUser.discriminator;
          this.scorer.addPoint(authorID, authorName, replyto);
        }
        else {
          // initial send
          message.mentions.users.map(x => {
            this.scorer.addPoint(authorID, authorName, x.username + '#' + x.discriminator);
          });
        }
        if(!dev)
          this.rolegivermngr.roleCheck(this.scorer.getScore(authorID), message);
      }
    });
    this.client.login(discord_token);

  }

  sendMessageTo(chid){
    let server = this.client.guilds.resolve(chid);
    let ch = await server.channels.fetch( (c) => c.id === chid);
    ch.send("**BOT IS ALIVE!!!**").then(
      console.log("**BOT IS ALIVE!!!** send to #vouch-bot")
    ).catch(console.error);
  }


}

module.exports = { VouchBot }