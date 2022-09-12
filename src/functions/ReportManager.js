const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Report = require('../models/Report');
const dUtil = require('../util/DiscordUtil');
const { reportsCHID, admins, reportTypes, verifiedReportsCHID } = require('../json/config.json');

class ReportManager {
  constructor() {
    this.modal = new ModalBuilder().setCustomId('reportModal');
    this.modal.addComponent(
      new ActionRowBuilder().addComponents(this.buildReportMenuField()),
      new ActionRowBuilder().addComponents(this.buildReportSummaryField()),
    );
  }

  async processReport(interaction) {
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
          interaction.createdAt
        );
        const reportContent = `Reporter: ${authorName}\nTarget: ${reportedName}\nCategory: ${category}\nSummary: ${summary}`;
        const finalReport = "**REPORT ID: #" + reportID + "**```" + reportContent + "```";
        await dUtil.sendMessageToChannel(interaction.client, interaction.guild.id, reportsCHID, finalReport);
        return `**REPORT FILED** ID: ${reportID}`;
      }
      case "verify": {
        let reply = "";
        if (!(admins.includes(author.id.toString()))) {
          reply = `**${authorName} not authorized to verify reports!**`;
        }
        else {
          const reportID = interaction.options.getString('id');
          const verifier = authorName;
          const verifyDate = interaction.createdAt;
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

        await dUtil.sendMessageToChannel(interaction.client, interaction.guild.id, reportsCHID, reply);
        return reply;
      }
    }
  }

  processModals(){

  }

  getVerifiedReportsCount(id) {
    return Report.countVerifiedReportsForUser(id);
  }

  buildReportMenuField() {
    let options = [];

    reportTypes.map( r => {
      options.push({
        label: r,
        description : "",
        value: r
      });
    })
    const menu = new SelectMenuBuilder()
      .setCustomId('reportType')
      .setPlaceholder('Report Type')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(options);
    return menu;
  }

  buildReportSummaryField() {
    const summary = new TextInputBuilder()
      .setCustomId('summary')
      .setLabel("Summary of report")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(250)
      .setMinLength(10)
      .setPlaceholder('Please entry a summary of your report')
      .setValue('Default')
      .setRequired(true);
    return summary;
  }

}

module.exports = { ReportManager };