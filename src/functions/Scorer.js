const { EmbedBuilder } = require('discord.js');
//const { DBManager } = require('../util/DBManager');
const { relevant_roles } = require('../../json/config.json');
const fs = require('fs');
const fileName = '../../json/scores.json';
const osFile = './json/scores.json';
let { scores } = require(fileName);
const util = require('../util/Utilities');
const dUtil = require('../util/DiscordUtil');

class Scorer {
  // removed dbmngr arg
  constructor() {
    //this.dbmngr = dbmngr;
  }

  createNewEntry(id1, id1_name, id2) {
    scores[id1] = JSON.parse(`{"username":"${id1_name}","points" : 1,"transactions":{"${id2}":0}}`);
  }

  /**
   * from https://www.codegrepper.com/code-examples/javascript/frameworks/react/how+to+update+a+json+file+javascript
   * above included
   * handles the file write-update of the JSON record for scores
   */
  updateScoreFile() {
    let dataStr = { "scores": scores };
    try {
      fs.writeFile(osFile, JSON.stringify(dataStr), function writeJSON(err) {
        if (err) return console.log(err);
      });
    }
    catch (err) {
      console.log(err);
    }
  }

  /**
   * adds point to id1 and updates its username. Adds a transaction with id2
   * @param {String} id1 : ID of sender
   * @param {String} id1_name : username of sender
   * @param {String} id2: username of mentioned/replied to 
   */
  addPoint(id1, id1_name, id2) {
    try {
      scores[id1].points += 1;
      scores[id1].username = id1_name; // to keep username updated (discord users can change usernames anytime)
    }
    catch (err) {
      this.createNewEntry(id1, id1_name, id2);
    }
    if (scores[id1]['transactions'][id2] == null)
      scores[id1]['transactions'][id2] = 0;
    scores[id1]['transactions'][id2] += 1;

    this.updateScoreFile();
    //this.dbmngr.addScore(id1, id1_name, id2);
  }

  /**
 * returns the user's stats from JSON records built into an EmbedBuilder instance
 * @param {discordjs.User} user 
 * @returns {discordjs.EmbedBuilder}
 */
  getStatsEmbed(interaction, user, reportmngr) {
    (async () => {
      let record = scores[user.id];
      let fullName = `${user.username}#${user.discriminator}`;
      let transStr = "";
      let roles = "";
      let creaStr = user.createdAt.toString();
      let dateData = util.getTimeDiff(user.createdAt);
      let creaDur = "";
      let gm = await dUtil.getGuildMemberfromID(user.id, interaction.guild).catch(console.error);
      let joinStr = gm.joinedAt.toString();
      let joinDur = "";
      let reportsCount = reportmngr.getVerifiedReportsCount(user.id.toString());

      Object.keys(dateData).forEach((x) => {
        creaDur += `${dateData[x]} `;
      });

      dateData = util.getTimeDiff(gm.joinedAt);

      Object.keys(dateData).forEach((x) => {
        joinDur += `${dateData[x]} `;
      });

      gm.roles.cache.map((r) => {
        if (relevant_roles.includes(r.name))
          roles += `<@&${r.id}> `;
      });
      
      if(roles == "") roles = "**NO ROLES**";

      if (record == null) {
        record = {}
        record["points"] = "ZERO";
        transStr = "NO TRANSACTIONS YET!";
      }
      else {
        // https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
        let sortedTrans = [];
        for (let t in record.transactions) {
          sortedTrans.push([t, record.transactions[t]]);
        }

        sortedTrans.sort(function (a, b) {
          return b[1] - a[1];
        });

        for (let i = 0; i < sortedTrans.length && i < 10; i++)
          transStr += `${sortedTrans[i][0]} : ${sortedTrans[i][1]}\n`;
      }

      interaction.reply({
        embeds: [this.generateScoreCard(
          fullName,
          record.points,
          user.displayAvatarURL(),
          roles,
          transStr,
          reportsCount.toString(),
          creaStr,
          creaDur,
          joinStr,
          joinDur
        )]
      }).catch(console.error);
    })();
  }

  /**
   * clears all scores from both JSON data and DB
   */
  clearScores() {
    scores = {};
    this.updateScoreFile();
    //this.dbmngr.clearScores();
  }

  /**
   * returns score of given ID from the JSON data
   * @param {String} id 
   * @returns {Number}
   */
  getScore(id) {
    if (scores[id] == null) return 0;
    else return scores[id].points;
  }

  /**
   * generates and send the score card from the given data
   * @param {String} fullName 
   * @param {Number} points 
   * @param {String} avatarURL 
   * @param {String} roles 
   * @param {Object} transStr 
   * @returns {discordjs.MessageEmbed}
   */
  generateScoreCard(fullName, points, avatarURL, roles, transStr, reportsCount, creationStr, creationDuration, joinStr, joinDuration) {
    const embedBuilder = new EmbedBuilder()
      .setColor("DarkAqua")
      .setTitle(`${points} Points`)
      .setAuthor({
        name: fullName,
        iconUrl: `${avatarURL}`
      })
      .setDescription(roles)
      .setThumbnail(`${avatarURL}`)
      .addFields({ name: 'Transactions (max 10):', value: transStr })
      .addFields({ name: 'Verified Reports Involved:', value: reportsCount })
      .addFields({ name: 'Account creation date:', value: `${creationStr}\n${creationDuration} from now` })
      .addFields({ name: 'Server join date:', value: `${joinStr}\n${joinDuration} from now` });

    return embedBuilder;
  }
}

module.exports = { Scorer }