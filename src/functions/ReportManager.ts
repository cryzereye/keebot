import { ActionRowBuilder, ChatInputCommandInteraction, MessageContextMenuCommandInteraction, ModalBuilder, Snowflake, TextInputBuilder, TextInputStyle } from "discord.js";
import { Post } from "../models/Post.js";
import { Report } from "../models/Report.js";
import { ReportType } from "../models/types/ReportType.js";
import { PostResult } from "../processor/types/PostResult.js";
import { ReportRepository } from '../repository/ReportRepository.js';
import { Manager } from "./Manager.js";

import { channelsID, reportTypes } from '../../json/config.json' assert { type: "json" };
import { constants } from '../globals/constants.json' assert { type: "json" };

export class ReportManager extends Manager {
	repo: ReportRepository;

	constructor() {
		super();
		this.repo = new ReportRepository();
	}

	async processReport(interaction: ChatInputCommandInteraction) {
		const { guild, user } = interaction;
		if (!guild) return;

		const reportType = interaction.options.getSubcommand(false);
		const author = interaction.user;
		const authorName = author.username + "#" + author.discriminator;
		switch (reportType) {
			case "file": {
				const reported = interaction.options.getUser('user');
				if (!(reported && guild)) return;
				const reportedName = reported.username + "#" + reported.discriminator;
				const category = interaction.options.getString('category');
				const summary = interaction.options.getString('summary');

				const reportID = this.repo.new(
					new Report(
						this.repo.cache.length + 1,
						author.id,
						authorName,
						reported.id,
						reportedName,
						Report.getCategoryFromString((category ? category : "")),
						(summary ? summary : "")
					)
				);
				const reportContent = `Reporter: ${authorName}\nTarget: ${reportedName}\nCategory: ${category}\nSummary: ${summary}`;
				const finalReport = "**REPORT ID: #" + reportID + "**```" + reportContent + "```";
				await DUTIL.sendMessageToChannel(guild.id, channelsID.reports, finalReport);
				return `**REPORT FILED** ID: ${reportID}`;
			}
			case "verify": {
				let reply = "";
				if (!(await DUTIL.isMod(guild, user.id))) {
					reply = `**${authorName} not authorized to verify reports!**`;
				}
				else {
					const reportID = interaction.options.getString('id');
					const verifier = authorName;
					const { report, gotVerified } = this.repo.verify(Number(reportID), verifier);

					if (report) {
						if (gotVerified) {
							reply = `**VERIFIED REPORT #${report.id}**`;
							reply += "```Verified by: " + report.verifiedBy + "\nOn: " + report.verifyDate + "```";
						}
						else {
							reply = `**REPORT #${reportID} ALREADY VERIFIED** `;
							reply += "```Verified by: " + report.verifiedBy + "\nOn: " + (report.verifyDate ? report.verifyDate.toString() : "UNKNOWN DATE") + "```";
						}
					}
					else {
						reply = `**REPORT DOES NOT EXIST** `;
					}

				}
				await DUTIL.sendMessageToChannel(guild.id, channelsID.reports, reply);
				return reply;
			}
		}
	}

	async reportPost(interaction: MessageContextMenuCommandInteraction): Promise<PostResult> {
		const { targetId, guild } = interaction;
		if (!guild) return constants.postReport_fail;

		const authorID = interaction.user.id;
		const authorName = interaction.user.username + "#" + interaction.user.discriminator;
		const channelID = interaction.channelId;
		const message = await DUTIL.getMessageFromID(guild, channelID, targetId).catch(console.error);

		if (message) {
			// default is users post the sales. before bot feature
			let reportedName = message.author.username + "#" + message.author.discriminator;
			let reportedID = message.author.id;
			let replied;
			const mentioned = message.mentions.users.values().next().value;

			// for bot-posted sales
			if (mentioned) {
				reportedName = mentioned.username + "#" + mentioned.discriminator;
				reportedID = mentioned.id;
			}

			if (reportedID === authorID) {
				try {
					replied = await interaction.reply({
						content: `**Why are you reporting yourself?**`,
						ephemeral: true
					});
					if (replied) return constants.selfReport_success;
				}
				catch (e) {
					return constants.selfReport_fail;
				}
			}

			const reportID = this.repo.new(
				new Report(
					this.repo.cache.length + 1,
					authorID,
					authorName,
					reportedID,
					reportedName,
					Report.getCategoryFromString(reportTypes[4]),
					"Something incorrect in the post"
				)
			);

			console.log(`[${new Date().toLocaleString()}] Report for ${reportedName} saved`);

			const content = `ID: ${reportID}\nReporter: <@${authorID}>\nTarget: <@${reportedID}>\n${Post.generateURL(channelID, targetId)}`;
			const filedReport = await DUTIL.sendMessageToChannel(guild.id, channelsID.reports, content);

			if (filedReport) {
				try {
					replied = await interaction.reply({
						content: `Report filed ID ${reportID}`,
						ephemeral: true
					});
					if (replied) return constants.postReport_success;
				}
				catch (e) {
					return constants.postReport_fail;
				}
			}
		}
		return constants.postReport_fail
	}

	getVerifiedReportsMatrix(id: Snowflake) {
		const reports = this.repo.getVerifiedReportsForUser(id);
		let reportStats = "";
		reportTypes.forEach((category) => {
			const fetched = reports.filter((entry: ReportType) => entry.category === category);
			if (fetched.length > 0)
				reportStats += `${category}: ${fetched.length}\n`;
		});
		return reportStats;
	}

	generateModal(target: Snowflake): ModalBuilder {
		const modal = new ModalBuilder();
		const components = [
			new ActionRowBuilder<TextInputBuilder>().addComponents(this.buildShortField("target", "User", target)),
			new ActionRowBuilder<TextInputBuilder>().addComponents(this.buildReportSummaryField())
		];

		modal.setCustomId("reportModal").setTitle("Submit a report");
		modal.addComponents(components);
		return modal;
	}

	buildShortField(id: Snowflake, label: string, value: string): TextInputBuilder {
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