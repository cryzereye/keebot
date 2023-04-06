const { EmbedBuilder } = require('discord.js');
const { me_id, admins, channelsID } = require('../../json/config.json');
const { commands } = require('../globals/commands.json');
const { constants } = require('../globals/constants.json');
const { MessageExtractor } = require('../util/MessageExtractor');
const dUtil = require('../util/DiscordUtil');

export class CommandProcessor {
	constructor() { }

	async processCommand(interaction, scorer, rolegivermngr, reportmngr, postfactory) {
		const { commandName, user, guild } = interaction;
		let fullName = `${user.username}#${user.discriminator}`;
		let interactionCHID = interaction.channel.id;

		if (interactionCHID != channelsID.bot && !(await dUtil.isMod(guild, user.id))) return await interaction.reply(`Use commands in <#${channelsID.bot}>`);

		switch (commandName) {
			case commands[0].name: {
				return this.doStats(interaction, scorer, reportmngr);
			}
			case commands[1].name: {
				return this.doExtract();
			}
			case commands[2].name: {
				return await interaction.reply({ embeds: [this.generateHelp(fullName)] }).catch(console.error);
			}
			case commands[3].name: {
				return await interaction.reply({
					content: await this.processReport(interaction, reportmngr),
					ephemeral: true
				});
			}
			case commands[4].name: {
				return postfactory.processCommand(interaction);
			}
		}
	}

	generateHelp(username) {
		const embedBuilder = new EmbedBuilder()
			.setColor("Default")
			.setTitle(`Help | ${username}`);

		constants.helpinfo.forEach((info) => {
			embedBuilder.addFields(info);
		})

		return embedBuilder;
	}

	async doExtract() {
		interaction.deferReply().then(console.log).catch(console.error);
		console.log(`[${new Date().toLocaleString()}] Checking if admin...`);

		if (!(await dUtil.isMod(guild, user.id)))
			return await interaction.reply(`Command not available for ${fullName}`).catch(console.error);

		console.log(`[${new Date().toLocaleString()}] Data extraction from #verify-transactions starting...`);

		let extractor = new MessageExtractor();
		extractor.extractAllMessages(interaction, scorer, rolegivermngr)
			.then(console.log(`[${new Date().toLocaleString()}] Extraction started`))
			.catch(console.error);
	}

	async doStats(interaction, scorer, reportmngr) {
		const target = interaction.options.getUser('user');
		if (target)
			return scorer.getStatsEmbed(interaction, target, reportmngr);
		return scorer.getStatsEmbed(interaction, interaction.user, reportmngr);
	}

	async processReport(interaction, reportmngr) {
		return await reportmngr.processReport(interaction);
	}

}