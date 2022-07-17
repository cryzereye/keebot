const { Client, Intents } = require('discord.js');
const { discord_token } = require('./json/config.json');
const { Scorer } = require('./Scorer');

class VouchBot{
  constructor(){
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
      if( message.author.id === this.client.user.id ) return; // if bot sent the message, ignore
      console.log(message.author.id);
      message.channel.send('henlo');
    });

    this.scorer = new Scorer();
    this.scorer.addPoint("144788912991240193", );

    this.client.login(discord_token);
  }
}

module.exports = { VouchBot }