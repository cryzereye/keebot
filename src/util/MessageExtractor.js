class MessageExtractor {
  constructor(){}

  async extractAllMessages(channel, scorer, rolegivermngr){
    let count = 0;
    let hasMoreMessages = true;
    let lastMessageID = channel.lastMessageId;
    scorer.clearScores();
    while(hasMoreMessages) {
      await channel.messages.fetch({ limit: 100, before: lastMessageID }).then(msglist => {
        let owner;
        msglist.forEach(msg =>{
          try {
            owner = msg.author.username + '#' + msg.author.discriminator;
            let mentions = msg.mentions.users; // mentioned by initial vouch
            console.log('Extracting data for ' + owner);
            mentions.map(x => {
              scorer.addPoint(msg.author.id.toString(), msg.author.username + '#' + msg.author.discriminator, x.username + '#' + x.discriminator);
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