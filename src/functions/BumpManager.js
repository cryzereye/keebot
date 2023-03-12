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
        const currDate = new Date();

        let currPost = this.queue.shift();
        if(!currPost) break;
        console.log("Processing bump/expiry " + currPost.have + "/" + currPost.want);

        // preps to get the original post message from channel
        let channel = Post.getChannelFromType(currPost.type);
        let origPost = await dUtil.getMessageFromID(
          await dUtil.getGuildFromID(this.client, channelsID.server),
          channel,
          currPost.postID
        ).catch(console.error);

        // if the original post message as fetched
        if (origPost) {
          let url = Post.generateUrl(channel, currPost.postID);

          // expired post processing
          if(new Date(currPost.expiryDate) < currDate){
            if(await this.spoilExpiredPost(origPost, currPost)){
              Post.expired(currPost.postID);
              break;
            }
          }

          // the actual bump process
          let message = await origPost.reply({
            content: `Bumping this post\n\n${url}`,
            embeds: [this.getEmbed(origPost.mentions.users.at(0), currPost)]
        }).catch(console.error);

          // updates to the post records or retries fails
          if (message) {
            let newBumpDate = util.addHours(Date.now(), 8 + (Math.random() * 4)); // randoms 8-12 hours
            if(dev)
              newBumpDate = util.addHours(Date.now(), Math.floor(Math.random() * 4)); // randoms 0-4 minutes
            Post.bumped(currPost.postID, newBumpDate);

            // add 60-day expiry date for bumped records without expiry date
            if(!currPost.expiryDate) {
              if(dev) Post.setExpiry(currPost.postID, util.addHours(Date.now(), 10)); // 10 mins post expiry
              else Post.setExpiry(currPost.postID, util.addHours(newBumpDate, 8 * 24 * 60)); // 60 days post expiry
            }

            // notifies post owner that the post will be expired soon
            if(new Date(newBumpDate) > new Date(currPost.expiryDate)){
              let user = await dUtil.getUserFromID(this.client, currPost.authorID);
              if(user){
                let expiryMsg;
                try{
                  expiryMsg = await user.send(`${url}\n\nLast bump done for the post above. This will be automatically marked as expired on ${currPost.expiryDate}`);
                }
                catch(e){
                  console.log(e);
                }
              }
            }
            
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
      .setDescription(`HAVE: ${post.have}\n\nWANT: ${post.want}`)
      .setThumbnail(`${avatarURL}`);

    return embedBuilder;
  }

  /**
   * marks all posts and related items as spoilers
   * @param {Discord.js.TextMessage} origPost 
   * @param {Snowflake} currPost 
   * @returns {Boolean} true
   */
  async spoilExpiredPost(origPost, currPost){
    await origPost.edit(`||${origPost.content}||`).catch(console.error);
    currPost.newListID.map(async (x) => {
      let ch = channelsID.newListings;
      await dUtil.makeMessageSpoiler(origPost.client, origPost.guild.id, ch, x);
    });
    return true;
  }
}

module.exports = { BumpManager }