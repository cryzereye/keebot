const Report = require('../models/Report');
const dUtil = require('../util/DiscordUtil');
const { reportsCHID } = require('../json/config.json');

class ReportManager {
  constructor() { }

  async processReport(interaction) {
    const reportType = interaction.options.getSubcommand(false);
    const author = interaction.user;
    switch (reportType) {
      case "file": {
        const reported = interaction.options.getUser('user');
        const category = interaction.options.getString('category');
        const summary = interaction.options.getString('summary');
        
        const reportID = Report.fileNewReport(
          author.id,
          author.username + "#" + author.discriminator,
          reported.id,
          reported.username + "#" + reported.discriminator,
          category,
          summary,
          interaction.createdAt
        );
        const reportContent = `Reporter: ${author.username}\nTarget: ${reported.username}\nCategory: ${category}\nSummary: ${summary}`;
        const finalReport = "**REPORT ID: #" + reportID + "**```" + reportContent + "```";
        await dUtil.sendMessageToChannel(interaction.client, interaction.guild.id, reportsCHID, finalReport);
        return `**REPORT FILED** ID: ${reportID}`;
      }
      case "verify": {
        const reportID = interaction.options.getString('id');
        Report.verifyReportFromFile(reportID, true);
        const reply = `Verified by: ${author.username}\nReport ID: ${reportID}`;
        await dUtil.sendMessageToChannel(interaction.client, interaction.guild.id, reportsCHID, reply);
        return reply;
      }
    }
  }

  getVerifiedReportsCount(id){
    return Report.countVerifiedReportsForUser(id);
  }

}

module.exports = { ReportManager };