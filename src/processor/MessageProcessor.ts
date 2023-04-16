import { Message, MessageType, Snowflake } from "discord.js";
import { BaseProcessor } from "./BaseProcessor.js";

export class MessageProcessor extends BaseProcessor {
  constructor() {
    super();
  }

  async processMessage(message: Message): Promise<void> {
    if (!(message && message.guild)) return;
    const authorID = message.author.id.toString();
    const botUser = CLIENT.user;
    if (botUser && authorID == botUser.id) return; // if bot sent the message, ignore

    const authorName = message.author.username + '#' + message.author.discriminator;
    const messageCHID = message.channel.id;
    const currentlyTesting = (messageCHID == CONFIG.data.channelsID.test && CONFIG.data.dev);
    if (this.isMarketChannel(messageCHID) && authorID !== CONFIG.data.discord_id) {
      await message.delete()
        .then(() => console.log(`[${new Date().toLocaleString()}] Deleted message from ${authorID}`))
        .catch(console.error);
    }
    else if (message.content.startsWith(CONFIG.data.command_sign)) {
      await message.reply("```Slash commands are now implemented! Please use /help for more details```");
    }
    else if (messageCHID == CONFIG.data.channelsID.verify && !CONFIG.data.dev || currentlyTesting) { // only for vouch channel
      console.log(`[${new Date().toLocaleString()}] Processing vouch msg from ${authorName}`);
      // process all verifications
      // id1 sender, id2 mentioned

      // possible reply back, 1 instance
      if (message.type == MessageType.Reply) {
        if (!message.mentions) return;

        const repliedUser = message.mentions.repliedUser;
        if (!repliedUser) return;

        const replyto = repliedUser.username + '#' + repliedUser.discriminator;
        if (authorName == replyto) message.reply(`**DO NOT CONFIRM FOR YOURSELF!** pinging <@${CONFIG.data.me_id}>`);
        else SCOREMNGR.addPoint(authorID, authorName, repliedUser.id, replyto);
      }
      else {
        // initial send
        message.mentions.users.map(x => {
          const mentionedUsername = x.username + '#' + x.discriminator;
          if (authorName == mentionedUsername) message.reply(`**DO NOT VOUCH YOURSELF!** pinging <@${CONFIG.data.me_id}>`);
          else SCOREMNGR.addPoint(authorID, authorName, x.id, mentionedUsername);
        });
      }
      if (!CONFIG.data.dev)
        ROLEGIVERMNGR.roleCheck(SCOREMNGR.getScore(authorID), message.author, message.guild);
    }
  }

  isMarketChannel(channelID: Snowflake): boolean {
    const marketChannels = [CONFIG.data.channelsID.selling, CONFIG.data.channelsID.buying, CONFIG.data.channelsID.trading];
    return (marketChannels.includes(channelID));
  }
}