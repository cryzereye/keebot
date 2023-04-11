import { BaseInteraction, Client, CommandInteraction, Emoji, FetchMessagesOptions, Guild, GuildMember, Message, ModalBuilder, ModalSubmitInteraction, Role, Snowflake, TextChannel, User } from "discord.js";

const { channelsID, modRole, serviceProviderRole, adminRole } = require('../../json/config.json');

export class DiscordUtilities {
	private client: Client;

	constructor() {
		this.client = globalThis.client;
	}

	public async getGuildMemberFromID(user: Snowflake, guild: Guild | Snowflake): Promise<GuildMember | void> {
		let guildInstance: Guild | void;
		if (guild instanceof Guild)
			guildInstance = guild;
		else
			guildInstance = await this.getGuildFromID(guild);
		if (guildInstance)
			return guildInstance.members.cache.get(user) || await guildInstance.members.fetch(user).catch(console.error);
	}

	public async sendMessageToChannel(guildID: Snowflake, chid: Snowflake, message: string): Promise<Message | void> {
		while (true) {
			let guild = await this.getGuildFromID(guildID).catch(console.error);
			if (!guild) return;

			let channel = await this.getTextChannelFromID(guild, chid).catch(console.error);
			if (!channel) return;

			return await channel.send(message).catch(console.error);
		}
	}

	async editMessageInChannel(guildID: Snowflake, chid: Snowflake, msgid: Snowflake, content: string): Promise<Boolean> {
		let guild = await this.getGuildFromID(guildID).catch(console.error);
		if (!guild) return false;

		let fetchedMsg = await this.getMessageFromID(guild, chid, msgid);

		if (fetchedMsg) {
			let response = await fetchedMsg.edit(content).catch(console.error);
			if (response) return true;
		}
		return false;
	}

	public async getGuildFromID(id: Snowflake): Promise<Guild | void> {
		return this.client.guilds.cache.get(id) || await this.client.guilds.fetch(id).catch(console.error);
	}

	public async getTextChannelFromID(guild: Guild, channelID: Snowflake): Promise<TextChannel | void | null> {
		const { channels } = guild;
		if (!channels) return null;

		let channel;

		if (channels.cache) channel = channels.cache.get(channelID);
		else channel = await guild.channels.fetch(channelID).catch(console.error);

		if (channel instanceof TextChannel) return channel;
	}

	public async guildMemberHasRole(gm: GuildMember, role: Role): Promise<Boolean> {
		let targetRole: Role | undefined;
		if (gm && role) {
			targetRole = gm.roles.cache.get(role.id);
			if (targetRole) return true;
		}
		return false;
	}

	public async isMod(guild: Guild, userID: Snowflake): Promise<Boolean> {
		let gm = await this.getGuildMemberFromID(userID, guild).catch(console.error);
		if (!gm) return false;
		let result = this.guildMemberHasRole(gm, modRole.id);
		return result;
	}

	public async isServiceProvider(guild: Guild, userID: Snowflake): Promise<Boolean> {
		let gm = await this.getGuildMemberFromID(userID, guild).catch(console.error);
		if (!gm) return false;
		let result = this.guildMemberHasRole(gm, serviceProviderRole.id);
		return result;
	}

	public async isAdmin(guild: Guild, userID: Snowflake): Promise<Boolean> {
		let gm = await this.getGuildMemberFromID(userID, guild).catch(console.error);
		if (!gm) return false;
		let result = this.guildMemberHasRole(gm, adminRole.id);
		return result;
	}

	public async addRoleToUser(user: User, guild: Guild, role: Role | void): Promise<void> {
		if (!(guild && role)) return;
		let gm = await this.getGuildMemberFromID(user.id, guild).catch(console.error);
		if (gm && !(await this.guildMemberHasRole(gm, role).catch(console.error))) {
			gm.roles.add(role).catch((e) => console.log(e.message));
			console.log(`[${new Date().toLocaleString()}] ${role.name} added to ${user.username}`);
		}
	}

	public async removeRoleFromUser(user: User, guild: Guild, role: Role): Promise<void> {
		let gm = await this.getGuildMemberFromID(user.id, guild).catch(console.error);
		if (gm && await this.guildMemberHasRole(gm, role).catch(console.error)) {
			gm.roles.remove(role).catch((e) => console.log(e.message));
			console.log(`[${new Date().toLocaleString()}] ${role.name} removed from ${user.username}`);
		}
	}

	public async getEmojiInstance(name: string, guildID: Snowflake): Promise<Emoji | undefined> {
		let guild = await this.getGuildFromID(guildID).catch(console.error);
		if (guild != undefined) {
			return guild.emojis.cache.get(name);
		}
	}

	public async getMessageFromID(guild: Guild, chid: Snowflake, msgid: Snowflake): Promise<Message | void> {
		let channel = await this.getTextChannelFromID(guild, chid).catch(console.error);
		if (channel instanceof TextChannel) {
			return channel.messages.cache.get(msgid) || await channel.messages.fetch(msgid).catch(console.error);
		}
	}

	public async postProcess(interaction: BaseInteraction, success: Boolean, content: string, isModal: Boolean, modal: ModalBuilder | null): Promise<void> {
		if (!success && interaction.guild)
			await this.sendMessageToChannel(interaction.guild.id, channelsID.keebotlogs, `<@${interaction.user.id}>\n${content}`);

		if (interaction instanceof CommandInteraction && isModal && modal) {
			await interaction.showModal(modal).catch(console.error);
		}
		else if (interaction instanceof ModalSubmitInteraction || interaction instanceof CommandInteraction) {
			await interaction.reply({
				content: content,
				ephemeral: true
			});

		}
	}

	public async makeMessageSpoiler(guildID: Snowflake, chid: Snowflake, msgid: Snowflake): Promise<Boolean> {
		let guild = await this.getGuildFromID(guildID).catch(console.error);
		if (!guild) return false;
		let fetchedMsg = await this.getMessageFromID(guild, chid, msgid);

		if (fetchedMsg) {
			let response = await fetchedMsg.edit(`||${fetchedMsg.content}||`).catch(console.error);
			if (response) return true;
		}
		return false;
	}

	public async getIdOfRepliedMsg(guild: Guild, chid: Snowflake, msgid: Snowflake): Promise<Snowflake | void> {
		let reply = await this.getMessageFromID(guild, chid, msgid);
		if (!reply) return;
		let origpost = await reply.fetchReference();
		if (origpost) return origpost.id;
	}

	public async getUserFromID(userID: Snowflake): Promise<User | void> {
		return await this.client.users.fetch(userID);
	}

	public async fetchAllMessagesMentionsUser(guild: Guild, userID: Snowflake, channelID: Snowflake): Promise<Array<Message> | void> {
		const channel = await this.getTextChannelFromID(guild, channelID);
		if (!channel) return;

		let hasMoreMessages = true;
		let lastMessageID: Snowflake = "";
		let userMentionsMessages = new Array<Message>;

		while (hasMoreMessages) {
			let options: FetchMessagesOptions = { limit: 100, before: "" };
			if (lastMessageID) options.before = lastMessageID;

			const messages = await channel.messages.fetch(options).catch(console.error);
			if (!(messages instanceof Array)) return;
			if (messages.length == 0) break;

			messages.forEach(msg => {
				console.log(msg);
				if (msg.mentions.users.has(userID))
					userMentionsMessages.push(msg);
				lastMessageID = msg.id;
			});

			if (messages.length % 100 != 0) hasMoreMessages = false;
		}
		return userMentionsMessages;
	}
}