const Post = require('../models/Post');
const dUtil = require('../util/DiscordUtil');
const util = require('../util/Utilities');
const { channelID } = require('../json/config.json');

class BumpManager {
  constructor(client) {
    this.client = client;
    this.queue = Post.getAllNeedsBump();
  }

  add(postID) {
    this.queue.push(Post.get(postID));
  }

  startService() {
    (async () => {
      let channel;
      let url;
      let message;
      while(true){
        this.queue.forEach(async(x) => {
          if(x.bumpDate < new Date().now()) {
            channel = Post.getChannelFromType(x.type);
            url = Post.generateUrl(channel, x.postID);
            message = await dUtil.sendMessageToChannel(
              this.client, channelID.server, channel,
              `Bumping this post\n${url}`
            )

            if(!message) this.queue.push(x);
            else {
              let newBumpDate = util.addHours(new Date().now(), 8);
              Post.bumped(x.postID, newBumpDate);
            }
          }
        });
        
        await new Promise(resolve => setTimeout(resolve, util.getMinutes(5)));
      }
    });
  }

  fillQueue() {

  }
}

module.exports = { BumpManager }