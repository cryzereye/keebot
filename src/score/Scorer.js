const { MessageEmbed, ColorResolvable } = require('discord.js');
const { DBManager } = require('../util/DBManager');
const fs = require('fs');
const fileName = '../json/scores.json';
const osFile = './src/json/scores.json';
let { scores } = require(fileName);

class Scorer {
  constructor(dbmngr){
    this.dbmngr = dbmngr;
  }

  createNewEntry(id1, id1_name, id2){
    scores[id1] = JSON.parse(`{"username":"${id1_name}","points" : 1,"transactions":{"${id2}":0}}`);
  }

  // from https://www.codegrepper.com/code-examples/javascript/frameworks/react/how+to+update+a+json+file+javascript
  // above included
  updateScoreFile(){
    let dataStr = {"scores": scores}
    fs.writeFile(osFile, JSON.stringify(dataStr), function writeJSON(err) {
      if (err) return console.log(err);
      console.log('Updated scores');
    });
  }

  addPoint(id1, id1_name, id2){
    try{
      scores[id1].points +=1;
      scores[id1].username = id1_name; // to keep username updated (discord users can change usernames anytime)
    }
    catch(err){
      this.createNewEntry(id1, id1_name, id2);
    }
    if(scores[id1]['transactions'][id2] == null)
      scores[id1]['transactions'][id2] = 0;
    scores[id1]['transactions'][id2] += 1;

    this.updateScoreFile();
    this.dbmngr.addScore(id1, id1_name, id2);
  }

  getStats(id){
    let str = '';
    if(scores[id] == null) str = 'No records yet!';
    else {
      str = `${scores[id].username}\nTransaction count: ${scores[id].points}\n\nWith:\n`;

      Object.keys(scores[id]['transactions']).forEach(key => {
        str += `${key}: ${scores[id]['transactions'][key]}\n`;
      });
    }

    return '```' + str + '```';
  }

  /**
   * returns the user's stats built into an EmbedBuilder instance
   * @param {discordjs.User} user 
   * @returns {discordjs.EmbedBuilder}
   */
  getStatsEmbed(user){
    let record;
    this.dbmngr.findRecord(user.id).then( r => record = r);

    let fullName = `${user.username}#${user.discriminator}`;
    if(record == undefined) {
      console.log("No record found for " + fullName);
      return ("No record found for " + fullName);
    }
    let transStr = "asdas";
    //record.transactions.map(x => {
    //  transStr += `${x.username} : ${x.points}\n`;
    //});

    const embedBuilder = new MessageEmbed()
      .setColor(ColorResolvable.DEFAULT)
      .setTitle(`${record.points} Points`)
      .setAuthor({
        name: fullName,
        iconUrl: `${user.avatarURL}`
      })
      .setDescription('asdasd')
      .setThumbnail(`${user.avatarURL}`)
      .addFields({ name: 'Transactions:', value: transStr });
    
    return embedBuilder;
  }

  clearScores(){
    scores = {};
    this.updateScoreFile();
    this.dbmngr.clearScores();
  }

  getScore(id){
    if(scores[id] == null) return 0;
    else return scores[id].points;
  }
}

module.exports = { Scorer }