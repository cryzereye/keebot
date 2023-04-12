import { Message, MessageType, Snowflake } from "discord.js";
import { BaseProcessor } from "./BaseProcessor";

import { dev, me_id, command_sign, channelsID, discord_id } from '../../json/config.json';

export class MessageProcessor extends BaseProcessor {
  constructor() {
    super();
  }

  async processMessage(message: Message): Promise<void> {
    if (!(message && message.guild)) return;
    const authorID = message.author.id.toString();
    const botUser = this.client.user;
    if (botUser && authorID == botUser.id) return; // if bot sent the message, ignore

    const authorName = message.author.username + '#' + message.author.discriminator;
    const messageCHID = message.channel.id;
    const currentlyTesting = (messageCHID == channelsID.test && dev);
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

        const replyto = repliedUser.username + '#' + repliedUser.discriminator;
        if (authorName == replyto) message.reply(`**DO NOT CONFIRM FOR YOURSELF!** pinging <@${me_id}>`);
        else globalThis.SCOREMNGR.addPoint(authorID, authorName, replyto);
      }
      else {
        // initial send
        message.mentions.users.map(x => {
          const mentioned = x.username + '#' + x.discriminator;
          if (authorName == mentioned) message.reply(`**DO NOT VOUCH YOURSELF!** pinging <@${me_id}>`);
          else globalThis.SCOREMNGR.addPoint(authorID, authorName, mentioned);
        });
      }
      if (!dev)
        globalThis.ROLEGIVERMNGR.roleCheck(globalThis.SCOREMNGR.getScore(authorID), message.author, message.guild);
    }
  }

  isMarketChannel(channelID: Snowflake): boolean {
    const marketChannels = [channelsID.selling, channelsID.buying, channelsID.trading];
    return (marketChannels.includes(channelID));
  }
}