const dUtil = require('../util/DiscordUtil');
const {serverID, verifyCHID } = require('../json/config.json');

class MessageExtractor {
  constructor(client){
    this.client = client;
  }

  /**
   * extracts all valid vouches from vouch channel
   * @param {DBManager} dbmngr: DBManager instance
   * @returns {Boolean}
   */
  async extractAllVouches(dbmngr){
    let channel = await dUtil.getChannelFromID(
      await dUtil.getGuildFromID(this.client, serverID).catch(console.error),
      verifyCHID
    ).catch(console.error);

    let count = 0;
    let countWithMention = 0; 
    let hasMoreMessages = true;
    let lastMessageID = channel.lastMessageId;

    await dbmngr.deleteAllVouch();
    while(hasMoreMessages) {
      await channel.messages.fetch({ limit: 100, before: lastMessageID }).then(msglist => {
        let owner;
        msglist.forEach(msg =>{
          try {
            owner = msg.author.username + '#' + msg.author.discriminator;
            let mentions = msg.mentions.users; // mentioned by initial vouch
            mentions.map(x => {
              countWithMention++;
              dbmngr.saveVouch(msg.id, msg.author.id, owner, x.username + '#' + x.discriminator, msg.content);
            });
          }
          catch(e){
            console.log('Error with extracting data for ' + owner);
            console.log(e);
          }
          count++;
          lastMessageID = msg.id;
        });
        if(count > 0 && count % 100 != 0) hasMoreMessages = false;
      })
      .catch(console.error); 
    }
    console.log('Message count: ' + count);
    console.log('Message with mentioned count: ' + countWithMention);
    return true;
  }
}

module.exports = { MessageExtractor }