const { MessageEmbed } = require('discord.js');
const { relevant_roles, dev } = require('../json/config.json');
const util = require('../util/Utilities');
const dUtil = require('../util/DiscordUtil');

class Scorer {
  constructor(dbmngr) {
    this.dbmngr = dbmngr;
  }
  /**
   * returns the user's stats from JSON records built into an EmbedBuilder instance
   * @param {discordjs.User} user 
   * @returns {discordjs.EmbedBuilder}
   */
  getStatsEmbed(interaction, user) {
    (async () => {
      const record = await this.dbmngr.getStats(user.id.toString());
      const fullName = `${user.username}#${user.discriminator}`;
      const gm = await dUtil.getGuildMemberfromID(user.id, interaction.guild).catch(console.error);
      const roles = dUtil.getRolesAsString(gm, relevant_roles);
      const { creaStr, creaDur, joinStr, joinDur } = this.getDatesData(user, gm);

      let transStr = "";

      if (record.points == 0) {
        record = {}
        record["points"] = "ZERO";
        transStr = "NO TRANSACTIONS YET!";
      }
      else
        transStr = this.sortTransAsString(record.transactions);

      await interaction.reply({
        embeds: [this.generateScoreCard(
          fullName,
          record.points,
          user.displayAvatarURL(),
          roles,
          transStr,
          creaStr,
          creaDur,
          joinStr,
          joinDur
        )]
      }).catch(console.error);
    })();
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
  generateScoreCard(fullName, points, avatarURL, roles, transStr, creationStr, creationDuration, joinStr, joinDuration) {
    const embedBuilder = new MessageEmbed()
      .setColor("DEFAULT")
      .setTitle(`${points} Points`)
      .setAuthor({
        name: fullName,
        iconUrl: `${avatarURL}`
      })
      .setDescription(roles)
      .setThumbnail(`${avatarURL}`)
      .addFields({ name: 'Transactions:', value: transStr })
      .addFields({ name: 'Account creation date:', value: `${creationStr}\n${creationDuration} from now` })
      .addFields({ name: 'Server join date:', value: `${joinStr}\n${joinDuration} from now` });

    return embedBuilder;
  }

  /**
   * generates date-related data for the stats
   * @param {discord.js.User} user 
   * @param {discord.js.GuildMember} gm 
   * @returns {Object} multiple String values
   */
  getDatesData(user, gm) {
    let creaDur = "";
    let joinDur = "";
    let dateData = util.getTimeDiff(user.createdAt);

    Object.keys(dateData).forEach((x) => {
      creaDur += `${dateData[x]} `;
    });

    dateData = util.getTimeDiff(gm.joinedAt);

    Object.keys(dateData).forEach((x) => {
      joinDur += `${dateData[x]} `;
    });

    return {
      creaStr: user.createdAt.toString(),
      creaDur: creaDur,
      joinStr: gm.joinedAt.toString(),
      joinDur: joinDur
    }
  }

  /**
   * takes the transaction object, sorts decreasing, then returns as string
   * https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
   * @param {Object} transactions 
   * @returns {String}
   */
  sortTransAsString(transactions) {
    let sortedTrans = [];
    let transStr = "";

    for (let t in transactions) {
      sortedTrans.push([t, transactions[t]]);
    }

    sortedTrans.sort(function (a, b) {
      return b[1] - a[1];
    });

    for (let i = 0; i < sortedTrans.length; i++)
      transStr += `${sortedTrans[i][0]} : ${sortedTrans[i][1]}\n`;

    return transStr;
  }
}

module.exports = { Scorer }