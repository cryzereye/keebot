import { ChatInputCommandInteraction, Client, CommandInteraction } from "discord.js";
import { StatsManager } from "../functions/StatsManager";
import { ReportManager } from "../functions/ReportManager";
import { PostFactory } from "../functions/post/PostFactory";
import { DiscordUtilities } from '../util/DiscordUtilities';
import { BaseProcessor } from "./BaseProcessor";
import { ExtractManager } from "../functions/ExtractManager";

const { EmbedBuilder } = require('discord.js');
const { channelsID } = require('../../json/config.json');
const { commands } = require('../globals/commands.json');
const { constants } = require('../globals/constants.json');

export class CommandProcessor extends BaseProcessor {
	private dUtil: DiscordUtilities;
	private statsmngr: StatsManager;
	private reportmngr: ReportManager;
	private extractmngr: ExtractManager;
	private postfactory: PostFactory;
	
	constructor(client: Client, dUtil: DiscordUtilities, statsmngr: StatsManager, reportmngr: ReportManager, extractmngr: ExtractManager, postfactory: PostFactory) {
		super(client);
		this.dUtil = dUtil;
		this.statsmngr = statsmngr;
		this.reportmngr = reportmngr;
		this.extractmngr = extractmngr;
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
			case commands[1].name: return this.extractmngr.doProcess(interaction);
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

	async doStats(interaction: ChatInputCommandInteraction) {
		this.statsmngr.doProcess(interaction);
	}

	async processReport(interaction: ChatInputCommandInteraction) {
		return await this.reportmngr.processReport(interaction);
	}

}