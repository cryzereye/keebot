import { Message, MessageType, Snowflake } from "discord.js";
import { BaseProcessor } from "./BaseProcessor";

const { dev, me_id, command_sign, channelsID, discord_id } = require('../../json/config.json');

export class MessageProcessor extends BaseProcessor {
  constructor() {
    super();
  }

  async processMessage(message: Message): Promise<void> {
    if (!(message && message.guild)) return;
    let authorID = message.author.id.toString();
    const botUser = this.client.user;
    if (botUser && authorID == botUser.id) return; // if bot sent the message, ignore

    let authorName = message.author.username + '#' + message.author.discriminator;
    let messageCHID = message.channel.id;
    let currentlyTesting = (messageCHID == channelsID.test && dev);
    if (this.isMarketChannel(messageCHID) && authorID !== discord_id) {
      await message.delete()
        .then(() => console.log(`[${new Date().toLocaleString()}] Deleted message from ${authorID}`))
        .catch(console.error);
    }
    else if (message.content.startsWith(command_sign)) {
      await message.reply("```Slash commands are now implemented! Please use /help for more details```");
    }
    else if (messageCHID == channelsID.verify && !dev || currentlyTesting) { // only for vouch channel
      console.log(`[${new Date().toLocaleString()}] Processing vouch msg from ${authorName}`);
      // process all verifications
      // id1 sender, id2 mentioned

      // possible reply back, 1 instance
      if (message.type == MessageType.Reply) {
        if (!message.mentions) return;

        const repliedUser = message.mentions.repliedUser;
        if (!repliedUser) return;

        let replyto = repliedUser.username + '#' + repliedUser.discriminator;
        if (authorName == replyto) message.reply(`**DO NOT CONFIRM FOR YOURSELF!** pinging <@${me_id}>`);
        else globalThis.scoremngr.addPoint(authorID, authorName, replyto);
      }
      else {
        // initial send
        message.mentions.users.map(x => {
          let mentioned = x.username + '#' + x.discriminator;
          if (authorName == mentioned) message.reply(`**DO NOT VOUCH YOURSELF!** pinging <@${me_id}>`);
          else globalThis.scoremngr.addPoint(authorID, authorName, mentioned);
        });
      }
      if (!dev)
        globalThis.rolegivermngr.roleCheck(globalThis.scoremngr.getScore(authorID), message.author, message.guild);
    }
  }

  isMarketChannel(channelID: Snowflake): Boolean {
    let marketChannels = [channelsID.selling, channelsID.buying, channelsID.trading];
    return (marketChannels.includes(channelID));
  }
}