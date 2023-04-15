import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { BaseProcessor } from "./BaseProcessor.js";


export class CommandProcessor extends BaseProcessor {
	constructor() {
		super();
	}

	async processCommand(interaction: ChatInputCommandInteraction): Promise<void> {
		const { commandName, user, guild, channel } = interaction;
		if (!(commandName && user && guild && channel)) return;

		const fullName = `${user.username}#${user.discriminator}`;
		const interactionCHID = channel.id;

		if (interactionCHID != CONFIG.data.channelsID.bot && !(await DUTIL.isMod(guild, user.id))) {
			await interaction.reply(`Use commands in <#${CONFIG.data.channelsID.bot}>`);
			return;
		}

		switch (commandName) {
			case COMMANDS.data[0].name: return this.doStats(interaction);
			case COMMANDS.data[1].name: return EXTRACTMNGR.doProcess(interaction);
			case COMMANDS.data[2].name: await interaction.reply({ embeds: [this.generateHelp(fullName)] }).catch(console.error); break;
			case COMMANDS.data[3].name: await interaction.reply({ content: await this.processReport(interaction), ephemeral: true }); break;
			case COMMANDS.data[4].name: return POSTFACTORY.processCommand(interaction);
		}
	}

	generateHelp(username: string) {
		const embedBuilder = new EmbedBuilder()
			.setColor("Default")
			.setTitle(`Help | ${username}`);

		CONSTANTS.data.helpinfo.forEach((info: any) => {
			embedBuilder.addFields(info);
		})

		return embedBuilder;
	}

	async doStats(interaction: ChatInputCommandInteraction) {
		STATSMNGR.doProcess(interaction);
	}

	async processReport(interaction: ChatInputCommandInteraction) {
		return await REPORTMNGR.processReport(interaction);
	}

}