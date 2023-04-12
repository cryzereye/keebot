import { ChatInputCommandInteraction } from "discord.js";
import { BaseProcessor } from "./BaseProcessor";

import { EmbedBuilder } from 'discord.js';
import { channelsID } from '../../json/config.json';
import { commands } from '../globals/commands.json';
import { constants } from '../globals/constants.json';

export class CommandProcessor extends BaseProcessor {
	constructor() {
		super();
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
			case commands[1].name: return globalThis.EXTRACTMNGR.doProcess(interaction);
			case commands[2].name: await interaction.reply({ embeds: [this.generateHelp(fullName)] }).catch(console.error); break;
			case commands[3].name: await interaction.reply({ content: await this.processReport(interaction), ephemeral: true }); break;
			case commands[4].name: return globalThis.POSTFACTORY.processCommand(interaction);
		}
	}

	generateHelp(username: string) {
		const embedBuilder = new EmbedBuilder()
			.setColor("Default")
			.setTitle(`Help | ${username}`);

		constants.helpinfo.forEach((info: any) => {
			embedBuilder.addFields(info);
		})

		return embedBuilder;
	}

	async doStats(interaction: ChatInputCommandInteraction) {
		globalThis.STATSMNGR.doProcess(interaction);
	}

	async processReport(interaction: ChatInputCommandInteraction) {
		return await globalThis.REPORTMNGR.processReport(interaction);
	}

}