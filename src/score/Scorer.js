const { MessageEmbed } = require('discord.js');
const { DBManager } = require('../util/DBManager');
const { RoleGiver } = require('../role/RoleGiver');
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
  getStatsEmbedDB(message, user){
    (async () => {
      let rg = new RoleGiver();
      let record = await this.dbmngr.findRecord(user.id);
      let fullName = `${user.username}#${user.discriminator}`;
      let transStr = "";
      let roles = "";

      let gm = await rg.fetchUser(user, message.guild);
      gm.roles.cache.map( (r) => {
        if(r.name != "@everyone")
          roles += `<@&${r.id}> `;
      });

      if(typeof record !== 'undefined' && record) {
        Object.keys(record.transactions).forEach(key => {
          transStr += `${key} : ${record.transactions[key]}\n`;
        });
      }
      else {
        record = {}
        record["points"] = "ZERO";
        transStr = "NO TRANSACTIONS YET!";
      }
      
      message.reply({ embeds: [this.generateScoreCard(
        fullName,
        record.points,
        user.avatarURL(),
        roles,
        transStr
      )]});
    })();
  }

  getStatsEmbed(message, user){
    (async () => {
      let record = scores[user.id];
      let fullName = `${user.username}#${user.discriminator}`;
      let transStr = "";
      let roles = "";

      let roleCache = await this.getUserRoles(user, message.guild);
      roleCache.map( (r) => {
        if(r.name != "@everyone")
          roles += `<@&${r.id}> `;
      });

      if (record == null){
        record = {}
        record["points"] = "ZERO";
        transStr = "NO TRANSACTIONS YET!";
      }
      else {
        Object.keys(record.transactions).forEach(key => {
          transStr += `${key} : ${record.transactions[key]}\n`;
        });
      }
      
      message.reply({ embeds: [this.generateScoreCard(
        fullName,
        record.points,
        user.avatarURL(),
        roles,
        transStr
      )]});
    })();
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

  async getUserRoles(user, guild){
    let rg = new RoleGiver();
    let gm = await rg.fetchUser(user, guild);
    return gm.roles.cache;
  }
  
  generateScoreCard(fullName, points, avatarURL, roles, transStr){
    const embedBuilder = new MessageEmbed()
        .setColor("DEFAULT")
        .setTitle(`${points} Points`)
        .setAuthor({
          name: fullName,
          iconUrl: `${avatarURL}`
        })
        .setDescription(roles)
        .setThumbnail(`${avatarURL}`)
        .addFields({ name: 'Transactions:', value: transStr });

    return embedBuilder;
  }
}

module.exports = { Scorer }