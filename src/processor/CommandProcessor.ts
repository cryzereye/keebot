import { ChatInputCommandInteraction, Client, CommandInteraction } from "discord.js";
import { Scorer } from "../functions/Scorer";
import { ReportManager } from "../functions/ReportManager";
import { PostFactory } from "../functions/post/PostFactory";
import { DiscordUtilities } from '../util/DiscordUtilities';
import { BaseProcessor } from "./BaseProcessor";

const { EmbedBuilder } = require('discord.js');
const { channelsID } = require('../../json/config.json');
const { commands } = require('../globals/commands.json');
const { constants } = require('../globals/constants.json');

export class CommandProcessor extends BaseProcessor {
	private dUtil: DiscordUtilities;
	private scorer: Scorer;
	private reportmngr: ReportManager;
	private postfactory: PostFactory;
	
	constructor(client: Client, dUtil: DiscordUtilities, scorer: Scorer, reportmngr: ReportManager, postfactory: PostFactory) {
		super(client);
		this.dUtil = dUtil;
		this.scorer = scorer;
		this.reportmngr = reportmngr;
		this.postfactory = postfactory;
	}

	async processCommand(interaction: ChatInputCommandInteraction): Promise<void> {
		const { commandName, user, guild, channel } = interaction;
		if (!(commandName && user && guild && channel)) return;

		const fullName = `${user.username}#${user.discriminator}`;
		const interactionCHID = channel.id;

		if (interactionCHID != channelsID.bot && !(await this.dUtil.isMod(guild, user.id))) {
			await interaction.reply(`Use commands in <#${channelsID.bot}>`);
			return;
		}

		switch (commandName) {
			case commands[0].name: return this.doStats(interaction);
			case commands[1].name: return this.doExtract();
			case commands[2].name: await interaction.reply({ embeds: [this.generateHelp(fullName)] }).catch(console.error); break;
			case commands[3].name: await interaction.reply({ content: await this.processReport(interaction), ephemeral: true}); break;
			case commands[4].name: return this.postfactory.processCommand(interaction);
		}
	}

	generateHelp(username: string) {
		const embedBuilder = new EmbedBuilder()
			.setColor("Default")
			.setTitle(`Help | ${username}`);

		constants.helpinfo.forEach((info: {}) => {
			embedBuilder.addFields(info);
		})

		return embedBuilder;
	}

	async doExtract() {
		// reserve for StatsManager

		/*interaction.deferReply().then(console.log).catch(console.error);
		console.log(`[${new Date().toLocaleString()}] Checking if admin...`);

		if (!(await dUtil.isMod(guild, user.id)))
			return await interaction.reply(`Command not available for ${fullName}`).catch(console.error);

		console.log(`[${new Date().toLocaleString()}] Data extraction from #verify-transactions starting...`);

		let extractor = new MessageExtractor();
		extractor.extractAllMessages(interaction, scorer, rolegivermngr)
			.then(console.log(`[${new Date().toLocaleString()}] Extraction started`))
			.catch(console.error);
		*/
	}

	async doStats(interaction: CommandInteraction) {
		const target = interaction.options.getUser('user');
		if (target)
			return this.scorer.getStatsEmbed(interaction, target, this.reportmngr);
		return this.scorer.getStatsEmbed(interaction, interaction.user, this.reportmngr);
	}

	async processReport(interaction: CommandInteraction) {
		return await this.reportmngr.processReport(interaction);
	}

}