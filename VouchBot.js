const { Client, Intents, TextChannel } = require('discord.js');
const { discord_token, command_sign, me_id, targetCHID, botCHID } = require('./json/config.json');
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
    this.client.login(discord_token);
    let vouchChannel = this.client.channels.cache.get(targetCHID);

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
        msg = this.scorer.getStats(authorID);
        message.reply(msg);
      }
      else if( message.content.startsWith(command_sign + 'extract')){
        console.log('Checking if admin...');
        if(authorID == me_id){ // commands from admin/me
          console.log('Data extraction from #verify-transactions starting...');
          let count = 0;
          let hasMoreMessages = true;
          let lastMessageID = "1008351176410026097";
          console.log(vouchChannel);
          while(hasMoreMessages) {
            vouchChannel.messages.fetch({ limit: 100, before: lastMessageID }).then(msglist => {
              let owner;
              msglist.forEach(msg =>{
                try {
                  owner = msg.author.username + '#' + msg.author.discriminator;
                  let mentions = msg.mentions.users; // mentioned by initial vouch
                  console.log('Extracting data for ' + owner);
                  mentions.map(x => {
                    this.scorer.addPoint(msg.author.id.toString(), msg.author.username + '#' + msg.author.discriminator, x.username + '#' + x.discriminator);
                  });
                }
                catch(e){
                  console.log('Error with extracting data for ' + owner);
                  console.log(e);
                }
                count++;
                if(count % 100 != 0){
                  hasMoreMessages = false;
                  lastMessageID = msg.id;
                }
              });
            })
            .catch(console.error);
            console.log('Message count: ' + count);
          }
        }
      }
      else {
        // only for vouch channel
        if(messageCHID != targetCHID) return;
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
  }
}

module.exports = { VouchBot }