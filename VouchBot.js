const { Client, Intents } = require('discord.js');
const { discord_token, command_sign } = require('./json/config.json');
const { Scorer } = require('./Scorer');

class VouchBot{
  constructor(){
    this.scorer = new Scorer();
    this.client = new Client({ 
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES, // required daw
      ]
    });

    // events detection
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}!`);
    });

    this.client.on('messageCreate',  message => {  // recent change yung messageCreate
      let msg = '';
      let authorID = message.author.id.toString();
      let authorName = message.author.username + '#' + message.author.discriminator;
      if( authorID === this.client.user.id ) return; // if bot sent the message, ignore
      if( message.content.startsWith(command_sign + 'stats')) {
        msg = this.scorer.getStats(authorID);
        message.reply(msg);
      }
      else {
        // process all verifications
        // id1 sender, id2 mentioned

        // initial send
        let mentions = message.mentions.users; // mentioned by initial vouch

        mentions.map(x => {
          this.scorer.addPoint(authorID, authorName, x.username + '#' + x.discriminator);
        });

        // possible reply back, 1 instance
        if(message.type == 'REPLY'){
          let replyto = message.mentions.repliedUser.username + '#' + message.mentions.repliedUser.discriminator;
          this.scorer.addPoint(authorID, replyto);
        }
      }
    });
    this.client.login(discord_token);
  }
}

module.exports = { VouchBot }