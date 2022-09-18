const Post = require('../models/Post');
const dUtil = require('../util/DiscordUtil');
const util = require('../util/Utilities');
const { channelID } = require('../json/config.json');

class BumpManager {
  constructor(client) {
    this.client = client;
    this.queue = [];
  }

  startService() {
    (async () => {
      // loop for check intervals
      while (true) {
        this.queue = Post.getAllNeedsBump();

        // loop for queue content
        while (true) {
          let currPost = this.queue.shift();

          // preps to get the original post message from channel
          let channel = Post.getChannelFromType(currPost.type);
          let origPost = dUtil.getMessageFromID(
            dUtil.getGuildFromID(this.client, channelID.server),
            channel,
            currPost.postID
          );

          // if the original post message as fetched
          if (origPost) {

            // the actual bump process
            let url = Post.generateUrl(channel, x.postID);
            let message = await origPost.reply(
              this.client, channelID.server, channel,
              `Bumping this post\n${url}`
            )

            // updates to the post records or retries fails
            if (message) {
              let newBumpDate = util.addHours(new Date().now(), 8);
              Post.bumped(currPost.postID, newBumpDate);
              break;
            }
            else this.queue.push(currPost) //retry
          }
          else this.queue.push(currPost) // retry
        }

        // wait next 5 mins to recheck the queue for posts to be bumped
        await new Promise(resolve => setTimeout(resolve, util.getMinutes(5)));
      }
    });
  }

  fillQueue() {

  }
}

module.exports = { BumpManager }