const Report = require('../models/Report');
const dUtil = require('../util/DiscordUtil');
const { reportsCHID, admins } = require('../json/config.json');

class ReportManager {
  constructor() { }

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

  getVerifiedReportsCount(id) {
    return Report.countVerifiedReportsForUser(id);
  }

}

module.exports = { ReportManager };