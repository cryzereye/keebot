const { dev, testCHID } = require('../json/config.json');
class MessageProcessor {
  constructor() { }

  async processMessage(message, scorer) {
    let authorID = message.author.id.toString();
    let authorName = message.author.username + '#' + message.author.discriminator;
    let messageCHID = message.channel.id;
    let currentlyTesting = (messageCHID == testCHID && dev);

    if (authorID === this.client.user.id) return; // if bot sent the message, ignore
    if (messageCHID == verifyCHID && !dev || !currentlyTesting) { // only for vouch channel
      console.log("Processing vouch msg from " + authorName);
      // process all verifications
      // id1 sender, id2 mentioned

      // possible reply back, 1 instance
      if (message.type == 'REPLY') {
        let replyto = message.mentions.repliedUser.username + '#' + message.mentions.repliedUser.discriminator;
        scorer.addPoint(authorID, authorName, replyto);
      }
      else {
        // initial send
        message.mentions.users.map(x => {
          scorer.addPoint(authorID, authorName, x.username + '#' + x.discriminator);
        });
      }
      if (!dev)
        this.rolegivermngr.roleCheck(scorer.getScore(authorID), message);
    }
  }
}

module.exports = { MessageProcessor }