const { EmbedBuilder } = require('discord.js');
const Post = require('../models/Post');
const dUtil = require('../util/DiscordUtil');
const util = require('../util/Utilities');
const { channelsID, dev } = require('../json/config.json');

class BumpManager {
  constructor(client) {
    this.client = client;
    this.queue = [];
  }

  async startService() {
    console.log("Bump service started..");
    // loop for check intervals
    while (true) {
      this.queue = Post.getAllNeedsBump();

      // loop for queue content
      while (true) {
        let currPost = this.queue.shift();
        if(!currPost) break;
        console.log("Bumping " + currPost.have);

        // preps to get the original post message from channel
        let channel = Post.getChannelFromType(currPost.type);
        let origPost = await dUtil.getMessageFromID(
          await dUtil.getGuildFromID(this.client, channelsID.server),
          channel,
          currPost.postID
        ).catch(console.error);

        // if the original post message as fetched
        if (origPost) {

          // the actual bump process
          let url = Post.generateUrl(channel, currPost.postID);
          let message = await origPost.reply({
            content: `Bumping this post\n\n${url}`,
            embeds: [this.getEmbed(origPost.mentions.users.at(0), currPost)]
        }).catch(console.error);

          // updates to the post records or retries fails
          if (message) {
            let newBumpDate = util.addHours(Date.now(), 8);
            Post.bumped(currPost.postID, newBumpDate);
            continue;
          }
          else this.queue.push(currPost) //retry
        }
        else this.queue.push(currPost) // retry
      }

      // wait next 5 mins to recheck the queue for posts to be bumped
      if(dev)
        await new Promise(resolve => setTimeout(resolve, util.getMinutes(1)));
      else
        await new Promise(resolve => setTimeout(resolve, util.getMinutes(5)));
    }
  }

  getEmbed(user, post){
    const authorName = user.username + '#' + user.discriminator;
    const avatarURL = user.displayAvatarURL();

    const embedBuilder = new EmbedBuilder()
      .setColor("DEFAULT")
      .setAuthor({
        name: authorName,
        iconUrl: `${avatarURL}`
      })
      .setThumbnail(`${avatarURL}`)
      .addDescription(`HAVE: ${post.have}\n\nWANT: ${post.want}`);

    return embedBuilder;
  }
}

module.exports = { BumpManager }