class MessageExtractor {
  constructor(){}

  async extractAllMessages(interaction, scorer, rolegivermngr){
    const channel = interaction.channel;
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
        msglist.forEach(async(msg) =>{
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
            console.log(`[${new Date().toLocaleString()}] Error with extracting data for ${owner}`);
            console.log(e);
          }
          count++;
          lastMessageID = msg.id;
          await new Promise(resolve => setTimeout(resolve, 50)); // 50 ms delay in between
        });
        if(count > 0 && count % 100 != 0) hasMoreMessages = false;
      })
      .catch(console.error); 
    }
    console.log(`[${new Date().toLocaleString()}] Message count: ${count}`);
    
    await interaction.reply({
      content: "Extraction complete",
      ephemeral: true
    }).catch(console.error);
  }

}
module.exports = { MessageExtractor }