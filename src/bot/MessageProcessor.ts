const { dev, me_id, command_sign, channelsID, discord_id } = require('../../json/config.json');
class MessageProcessor {
  constructor() { }

  async processMessage(message, clientID, scorer, rolegivermngr) {
    let authorID = message.author.id.toString();
    if (authorID === clientID) return; // if bot sent the message, ignore

    let authorName = message.author.username + '#' + message.author.discriminator;
    let messageCHID = message.channel.id;
    let currentlyTesting = (messageCHID == channelsID.test && dev);
    if(this.isMarketChannel(messageCHID) && authorID !== discord_id){
      return message.delete()
            .then(console.log(`[${new Date().toLocaleString()}] Deleted message from ${authorID}`))
            .catch(console.error);
    }
    else if(message.content.startsWith(command_sign)){
      return await message.reply("```Slash commands are now implemented! Please use /help for more details```");
    }
    else if (messageCHID == channelsID.verify && !dev || currentlyTesting) { // only for vouch channel
      console.log(`[${new Date().toLocaleString()}] Processing vouch msg from ${authorName}`);
      // process all verifications
      // id1 sender, id2 mentioned

      // possible reply back, 1 instance
      if (message.type == 'REPLY') {
        let replyto = message.mentions.repliedUser.username + '#' + message.mentions.repliedUser.discriminator;
        if(authorName == replyto) message.reply(`**DO NOT CONFIRM FOR YOURSELF!** pinging <@${me_id}>`);
        else scorer.addPoint(authorID, authorName, replyto);
      }
      else {
        // initial send
        message.mentions.users.map(x => {
          let mentioned = x.username + '#' + x.discriminator;
          if(authorName == mentioned) message.reply(`**DO NOT VOUCH YOURSELF!** pinging <@${me_id}>`);
          else scorer.addPoint(authorID, authorName, mentioned);
        });
      }
      if (!dev)
        rolegivermngr.roleCheck(scorer.getScore(authorID), message);
    }
  }

  isMarketChannel(channel){
    let marketChannels = [channelsID.selling, channelsID.buying, channelsID.trading];
    return (marketChannels.includes(channel));
  }
}

module.exports = { MessageProcessor }