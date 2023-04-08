import { Channel, Client, CommandInteraction, Emoji, FetchMessageOptions, Guild, GuildBasedChannel, GuildMember, Interaction, Message, ModalBuilder, ModalSubmitInteraction, Options, Role, Snowflake, TextBasedChannel, TextChannel, User } from "discord.js";

const { MessageType } = require('discord-api-types/v10');
const { channelsID, modRole, serviceProviderRole } = require('../../json/config.json');

/**
 * returns the GuildMember equivalent of ID given
 * @param {Snowflake} id : User id
 * @param {Guild} guild 
 * @returns {GuildMember}
 */
export async function getGuildMemberfromID (targetID: Snowflake, guild: Guild) : Promise<GuildMember | void>  {
	return guild.members.cache.get(targetID) || await guild.members.fetch(targetID).catch(console.error);
}

/**
 * sends message to target channel (id). client and guild instances are required
 * @param {discord.js.Client} client 
 * @param {Snowflake} guildID 
 * @param {Snowflake} chid 
 * @param {String} message 
 * @return {discord.js.Message} sent message
 */
export async function sendMessageToChannel (client: Client, guildID: Snowflake, chid: Snowflake, message: string) : Promise<Message | void> {
	while (true) {
		let guild = await getGuildFromID(client, guildID).catch(console.error);
		if (guild) {
			let channel = await getTextChannelFromID(guild, chid).catch(console.error);
			if (channel) {
				return await channel.send(message).catch(console.error);
			}
		}
	}
}

/**
 * Edits a message from target channel (id). client and guild instances are required
 * @param {discord.js.Client} client 
 * @param {Snowflake} guildID 
 * @param {Snowflake} chid : Channel ID
 * @param {Snowflake} msgid: Message ID
 * @param {String} content 
 * @return {Boolean}: if sent successfully
 */
export async function editMessageInChannel (client: Client, guildID: Snowflake, chid: Snowflake, msgid: Snowflake, content: string) : Promise<Boolean> {
	let guild = await getGuildFromID(client, guildID).catch(console.error);
	if(!guild) return false;

	let fetchedMsg = await getMessageFromID(guild, chid, msgid);

	if (fetchedMsg) {
		let response = await fetchedMsg.edit(content).catch(console.error);
		if (response) return true;
	}
	return false;
}

/**
 * gets guild instance from ID
 * @param {discord.js.} client 
 * @param {Snowflake} guildID 
 * @returns {discord.js.Guild}
 */
export async function getGuildFromID (client: Client, guildID: Snowflake) : Promise<Guild | void> {
	return await client.guilds.cache.get(guildID) || await client.guilds.fetch(guildID).catch(console.error);
}

/**
 * returns Channel instance using its ID
 * @param {discord.js.Guild} guild 
 * @param {Snowflake} channelID 
 * @returns {discord.js.Channel}
 */
export async function getTextChannelFromID (guild: Guild, channelID: Snowflake) : Promise<TextChannel | void | null> {
	let channel = guild.channels.cache.get(channelID) || await guild.channels.fetch(channelID).catch(console.error);
	if(channel instanceof TextChannel) return channel;
}

/**
 * checks if given GuildMember has the given Role
 * @param {discord.js.GuildMember} gm 
 * @param {discord.js.Role} role 
 * @returns {Boolean}
 */
export async function guildMemberHasRole(gm: GuildMember, role: Role): Promise<Boolean> {
	let targetRole: Role | undefined;
	if (gm && role) {
		targetRole = gm.roles.cache.get(role.id);
		if(targetRole) return true;
	}
	return false;
}

/**
 * adds the given Role to the given User
 * @param {discord.js.User} user 
 * @param {discord.js.Guild} guild 
 * @param {discord.js.Role} role 
 */
export async function addRoleToUser(user: User, guild: Guild, role: Role): Promise<void> {
	let gm = await getGuildMemberfromID(user.id, guild).catch(console.error);
	if (gm && !(await guildMemberHasRole(gm, role).catch(console.error))) {
		gm.roles.add(role).catch((e) => console.log(e.message));
		console.log(`[${new Date().toLocaleString()}] ${role.name} added to ${user.username}`);
	}
}

/**
 * removes the given Role to the given User
 * @param {discord.js.User} user 
 * @param {discord.js.Guild} guild 
 * @param {discord.js.Role} role 
 */
export async function removeRoleToUser (user: User, guild: Guild, role: Role): Promise<void> {
	let gm = await getGuildMemberfromID(user.id, guild).catch(console.error);
	if (gm && await guildMemberHasRole(gm, role).catch(console.error)) {
		gm.roles.remove(role).catch((e) => console.log(e.message));
		console.log(`[${new Date().toLocaleString()}] ${role.name} removed from ${user.username}`);
	}
}

/**
 * returns Emoji instance using its name
 * @param {String} name: Emoji name
 * @param {discord.js.Client} client 
 * @param {Snowflake} guildID 
 * @returns {discord.js.Emoji}
 */
export async function getEmojiInstance (name: string, client: Client, guildID: Snowflake): Promise<Emoji | undefined> {
	let guild = await getGuildFromID(client, guildID).catch(console.error);
	if (guild != undefined) {
		return guild.emojis.cache.get(name);
	}
}

/**
 * returns a message instance from the given message id
 * @param {discord.js.Guild} guild: guild instance
 * @param {String} chid: channel id
 * @param {String} msgid: message id
 * @returns {discord.js.Message}
 */
export async function getMessageFromID(guild: Guild, chid: Snowflake, msgid: Snowflake): Promise<Message | void> {
	let channel = await getTextChannelFromID(guild, chid).catch(console.error);
	if(channel instanceof TextChannel){
		return channel.messages.cache.get(msgid) || await channel.messages.fetch(msgid).catch(console.error);
	}
}

/**
 * does the replies and logging after user interactions
 * @param {CommandInteraction} interaction 
 * @param {Boolean} success 
 * @param {String} content 
 * @param {Boolean} isModal
 * @param {discord.js.Modal} modal
 */
export async function postProcess(interaction: CommandInteraction, success: Boolean, content: string, isModal: Boolean, modal: ModalBuilder): Promise<void> {
	if (!success && interaction.guild)
		await sendMessageToChannel(interaction.client, interaction.guild.id, channelsID.keebotlogs, `<@${interaction.user.id}>\n${content}`);
	if (isModal) {
		await interaction.showModal(modal).catch(console.error);
	}
	else {
		try {
			await interaction.reply({
				content: content,
				ephemeral: true
			});
		}
		catch (e) { }
	}
}

/**
 * Edits a message from target channel (id). client and guild instances are required
 * @param {Client} client 
 * @param {Snowflake} guildID 
 * @param {Snowflake} chid : Channel ID
 * @param {Snowflake} msgid: Message ID
 * @return {Boolean}: if sent successfully
 */
export async function makeMessageSpoiler(client: Client, guildID: Snowflake, chid: Snowflake, msgid: Snowflake): Promise<Boolean> {
	let guild = await getGuildFromID(client, guildID).catch(console.error);
	if(!guild) return false;
	let fetchedMsg = await getMessageFromID(guild, chid, msgid);

	if (fetchedMsg) {
		let response = await fetchedMsg.edit(`||${fetchedMsg.content}||`).catch(console.error);
		if (response) return true;
	}
	return false;
}


/**
 * Returns the ID of the message to which msgid replied to
 * @param {Client} client 
 * @param {Snowflake} guildID 
 * @param {Snowflake} chid : Channel ID
 * @param {Snowflake} msgid: Message ID
 * @return {Snowflake}: ID of message replied to
 */
export async function getIdOfRepliedMsg(guild: Guild, chid: Snowflake, msgid: Snowflake): Promise<Snowflake | void> {
	let reply = await getMessageFromID(guild, chid, msgid);
	if(!reply) return;
	let origpost = await reply.fetchReference();
	if (origpost) return origpost.id;
}

export async function isMod(guild: Guild, userID: Snowflake): Promise<Boolean> {
	let gm = await getGuildMemberfromID(userID, guild).catch(console.error);
	if(!gm) return false;
	let result = guildMemberHasRole(gm, modRole.id);
	return result;
}

export async function isServiceProvider(guild: Guild, userID: Snowflake): Promise<Boolean> {
	let gm = await getGuildMemberfromID(userID, guild).catch(console.error);
	if(!gm) return false;
	let result = guildMemberHasRole(gm, serviceProviderRole.id);
	return result;
}

export async function getUserFromID(client: Client, userID: Snowflake): Promise<User | void> {
	return await client.users.fetch(userID);
}

export async function fetchAllMessagesMentionsUser(client: Client, guild: Guild, userID: Snowflake, channelID: Snowflake): Promise<Array<Message> | void> {
	const channel = await getTextChannelFromID(guild, channelID);
	if(!channel) return;

	let hasMoreMessages = true;
	let lastMessageID;
	let userMentionsMessages = new Array<Message>;

	while (hasMoreMessages) {
		let options:any = { limit: 100, before: ""};
		if (lastMessageID) options.before = lastMessageID;

		const messages = await channel.messages.fetch(options).catch(console.error);
		if(!(messages instanceof Array<Message>) || messages.length == 0) break;

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