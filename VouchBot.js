const { Client, Intents } = require('discord.js');
const { discord_token } = require('./config.json');

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

      message.channel.send('henlo');
    });

    this.client.login(discord_token);
  }
}

module.exports = { VouchBot }