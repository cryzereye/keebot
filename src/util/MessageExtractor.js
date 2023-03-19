class MessageExtractor {
  constructor(){}

  async extractAllMessages(channel, scorer, rolegivermngr){
    let count = 0;
    let hasMoreMessages = true;
    let lastMessageID;
    scorer.clearScores();
    while(hasMoreMessages) {

      // from https://stackoverflow.com/questions/55153125/fetch-more-than-100-messages
      let options = { limit: 100 };
      if(lastMessageID) options.before = lastMessageID;

      await channel.messages.fetch(options).then(msglist => {
        let owner;
        msglist.forEach(msg =>{
          try {
            owner = msg.author.username + '#' + msg.author.discriminator;
            let mentions = msg.mentions.users; // mentioned by initial vouch
            mentions.map(x => {
              //added async sequence here
              scorer.addPoint(msg.author.id.toString(), owner, x.username + '#' + x.discriminator);
              rolegivermngr.roleCheck(scorer.getScore(msg.author.id.toString()), msg);
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
    return true;
  }

}
module.exports = { MessageExtractor }