import { MessageContextMenuCommandInteraction } from "discord.js";
import { PostResult } from "../processor/types/PostResult";

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Report = require('../models/Report');
const Post = require('../models/Post');
const dUtil = require('../util/DiscordUtil');
const { admins, channelsID, reportTypes } = require('../../json/config.json');
const { constants } = require('../globals/constants.json');

export class ReportManager {
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
        if (!(await dUtil.isMod(guild, user.id))) {
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

  async reportPost(interaction: MessageContextMenuCommandInteraction): Promise <PostResult> {
    const { targetId } = interaction;
    const authorID = interaction.user.id;
    const authorName = interaction.user.username + "#" + interaction.user.discriminator;
    const channelID = interaction.channelId;
    const message = await dUtil.getMessageFromID(interaction.member.guild, channelID, targetID).catch(console.error);

    if (message) {
      // default is users post the sales. before bot feature
      let reportedName = message.author.username + "#" + message.author.discriminator;
      let reportedID = message.author.id;
      let replied;
      const mentioned = message.mentions.users.values().next().value;

      // for bot-posted sales
      if (mentioned) {
        reportedName = mentioned.username + "#" +mentioned.discriminator;
        reportedID = mentioned.id;
      }

      if (reportedID === authorID){
        try {
          replied = await interaction.reply({
            content: `**Why are you reporting yourself?**`,
            ephemeral: true
          });
          if(replied) return constants.selfReport_success;
        }
        catch(e){
          return  constants.selfReport_fail;
        }
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

      console.log(`[${new Date().toLocaleString()}] Report for ${reportedName} saved`);

      let content = `ID: ${reportID}\nReporter: <@${authorID}>\nTarget: <@${reportedID}>\n${Post.generateUrl(channelID, targetID)}`;
      let filedReport = await dUtil.sendMessageToChannel(interaction.client, interaction.guild.id, channelsID.reports, content);

      if (filedReport) {
        try{
          replied = await interaction.reply({
            content: `Report filed ID ${reportID}`,
            ephemeral: true
          });
          if(replied) return constants.postReport_success;
        }
        catch(e){
          return constants.postReport_fail;
        }
      }
    }

  }

  getVerifiedReportsMatrix(id) {
    let reports = Report.getVerifiedReportsForUser(id);
    let reportStats = "";
    reportTypes.forEach(type =>{
      let fetched = reports.filter((entry) => entry.category === type);
      if(fetched.length > 0)
        reportStats += `${type}: ${fetched.length}\n`;
    });
    return reportStats;
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