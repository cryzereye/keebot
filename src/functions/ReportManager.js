const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Report = require('../models/Report');
const Post = require('../models/Post');
const dUtil = require('../util/DiscordUtil');
const { admins, channelsID, reportTypes } = require('../json/config.json');

class ReportManager {
  constructor(client) {
    this.client = client;
  }

  async processReport(interaction) {
    const {guild, user} = interaction;
    const reportType = interaction.options.getSubcommand(false);
    const author = interaction.user;
    const authorName = author.username + "#" + author.discriminator;
    switch (reportType) {
      case "file": {
        const reported = interaction.options.getUser('user');
        const reportedName = reported.username + "#" + reported.discriminator;
        const category = interaction.options.getString('category');
        const summary = interaction.options.getString('summary');

        const reportID = Report.fileNewReport(
          author.id,
          authorName,
          reported.id,
          reportedName,
          category,
          summary,
          new Date(interaction.createdAt).toString()
        );
        const reportContent = `Reporter: ${authorName}\nTarget: ${reportedName}\nCategory: ${category}\nSummary: ${summary}`;
        const finalReport = "**REPORT ID: #" + reportID + "**```" + reportContent + "```";
        await dUtil.sendMessageToChannel(interaction.client, interaction.guild.id, channelsID.reports, finalReport);
        return `**REPORT FILED** ID: ${reportID}`;
      }
      case "verify": {
        let reply = "";
        if (!(dUtil.isMod(guild, user))) {
          reply = `**${authorName} not authorized to verify reports!**`;
        }
        else {
          const reportID = interaction.options.getString('id');
          const verifier = authorName;
          const verifyDate = new Date(interaction.createdAt).toString();
          const { verified, report } = Report.verifyReportFromFile(reportID, true, verifier, verifyDate);

          if (verified) {
            reply = `**VERIFIED REPORT #${reportID}**`;
            reply += "```Verified by: " + authorName + "\nOn: " + verifyDate.toString() + "```";
          }
          else {
            reply = `**REPORT #${reportID} ALREADY VERIFIED** `;
            reply += "```Verified by: " + report.verifier + "\nOn: " + report.verifyDate.toString() + "```";
          }
        }

        await dUtil.sendMessageToChannel(interaction.client, interaction.guild.id, channelsID.reports, reply);
        return reply;
      }
    }
  }

  async reportPost(interaction, targetID) {
    const authorID = interaction.user.id;
    const authorName = interaction.user.username + "#" + interaction.user.discriminator;
    const channelID = interaction.channelId;
    const message = await dUtil.getMessageFromID(interaction.member.guild, channelID, targetID).catch(console.error);

    if (message) {
      // default is users post the sales. before bot feature
      let reportedName = message.author.username + "#" + message.author.discriminator;
      let reportedID = message.author.id;
      const mentioned = message.mentions.users.values().next().value;

      // for bot-posted sales
      if (mentioned) {
        reportedName = mentioned.username + "#" +mentioned.discriminator;
        reportedID = mentioned.id;
      }

      if (reportedID === this.client.user.id) {
        return await interaction.reply({
          content: `**Invalid report!** Refer to the original post. Not on the bumps`,
          ephemeral: true
        });
      }
      if (reportedID === authorID){
        return await interaction.reply({
          content: `**Why are you reporting yourself?**`,
          ephemeral: true
        });
      }

      const reportID = Report.fileNewReport(
        authorID,
        authorName,
        reportedID,
        reportedName,
        reportTypes[4],
        "Something incorrect in the post",
        new Date(interaction.createdAt).toString()
      );

      console.log(`Report for ${reportedName} saved`);

      let content = `ID: ${reportID}\nReporter: <@${authorID}>\nTarget: <@${reportedID}>\n${Post.generateUrl(channelID, targetID)}`;
      let filedReport = await dUtil.sendMessageToChannel(interaction.client, interaction.guild.id, channelsID.reports, content);
      if (filedReport) {
        return await interaction.reply({
          content: `Report filed ID ${reportID}`,
          ephemeral: true
        });
      }
    }

  }

  getVerifiedReportsCount(id) {
    return Report.countVerifiedReportsForUser(id);
  }

  generateModal(target) {
    let modal = new ModalBuilder();
    let components = [
      new ActionRowBuilder().addComponents(this.buildShortField("target", "User", target)),
      new ActionRowBuilder().addComponents(this.buildReportSummaryField())
    ];

    modal.setCustomId("reportModal").setTitle("Submit a report");
    modal.addComponents(components);
    return modal;
  }

  buildShortField(id, label, value) {
    const field = new TextInputBuilder()
      .setCustomId(id)
      .setLabel(label)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(200)
      .setMinLength(1)
      .setPlaceholder(`Enter ${label}`)
      .setValue(value)
      .setRequired(true);
    return field;
  }

  buildReportSummaryField() {
    const summary = new TextInputBuilder()
      .setCustomId('summary')
      .setLabel("Summary of report")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(500)
      .setMinLength(1)
      .setPlaceholder('Please entry a summary of your report')
      .setValue('Default')
      .setRequired(true);
    return summary;
  }
}

module.exports = { ReportManager };