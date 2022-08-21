const { Client, Intents } = require('discord.js');
const { discord_token, command_sign, me_id, targetCHID, botCHID, nonkb_rolename, nonkb_filter } = require('./json/config.json');
const { Scorer } = require('./Scorer');
const { MessageExtractor } = require('./MessageExtractor');
const { RoleGiver } = require('./RoleGiver');

class VouchBot{
  constructor(){
    this.scorer = new Scorer();
    this.client = new Client({ 
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES, // required daw
      ]
    });
    this.rolegiver = new RoleGiver(this.client);

    // events detection
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}!`);
    });

    this.client.on('messageCreate',  message => {  // recent change yung messageCreate
      let msg = '';
      let authorID = message.author.id.toString();
      let authorName = message.author.username + '#' + message.author.discriminator;
      let messageCHID = message.channel.id;
      if( authorID === this.client.user.id ) return; // if bot sent the message, ignore
      if( message.content.startsWith(command_sign + 'stats') && messageCHID == botCHID) {
        let count = 0;
        message.mentions.users.map(x => {
          msg = this.scorer.getStats(x.id);
          message.reply(msg);

          count++;
        });
        if(count == 0){
          msg = this.scorer.getStats(authorID);
          message.reply(msg);
        }
      }
      else if(message.content.startsWith(command_sign + 'extract')){
        console.log('Checking if admin...');
        if(authorID == me_id){ // commands from admin/me
          console.log('Data extraction from #verify-transactions starting...');
          let extractor = new MessageExtractor();
          extractor.extractAllMessages(message.channel, this.scorer, this.rolegiver, nonkb_filter, this.getRole(message, 'nonkb'));
          message.delete();
        }
      }
      else {
        // only for vouch channel
        if(messageCHID != targetCHID) return;
        // process all verifications
        // id1 sender, id2 mentioned

        // possible reply back, 1 instance
        if(message.type == 'REPLY'){
          let replyto = message.mentions.repliedUser.username + '#' + message.mentions.repliedUser.discriminator;
          this.scorer.addPoint(authorID, authorName, replyto);
          //if(this.scorer.getScore(authorID) > nonkb_filter)
          //  this.rolegiver.addRoleToUser(message.author, this.getRole(message, 'nonkb'));
        }
        else {
          // initial send
          message.mentions.users.map(x => {
            this.scorer.addPoint(authorID, authorName, x.username + '#' + x.discriminator);
          //  if(this.scorer.getScore(authorID) > nonkb_filter)
          //    this.rolegiver.addRoleToUser(message.author, this.getRole(message, 'nonkb'));
          });
        }
        if(this.scorer.getScore(authorID) > nonkb_filter)
          this.rolegiver.addRoleToUser(message.author, message.guild, this.getRole(message, 'nonkb'));
      }
    });
    this.client.login(discord_token);
    
  }

  getRole(message, type){
    switch(type){
      case 'nonkb': return message.guild.roles.cache.find((r) => r.name == nonkb_rolename);
    }
  }
}

module.exports = { VouchBot }