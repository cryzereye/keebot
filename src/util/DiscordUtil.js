const { MessageType } = require('discord-api-types/v10');
const { channelsID, modRole, serviceProviderRole } = require('../../json/config.json');

/**
 * returns the GuildMember equivalent of ID given
 * @param {Snowflake} id : User id
 * @param {discord.js.Guild} guild 
 * @returns {discord.js.GuildMember}
 */
exports.getGuildMemberfromID = async (id, guild) => {
  return await guild.members.cache.get((gm) => gm.id == id) ||
    await guild.members.fetch(id).catch(console.error);
}

/**
 * sends message to target channel (id). client and guild instances are required
 * @param {discord.js.Client} client 
 * @param {Snowflake} guildID 
 * @param {Snowflake} chid 
 * @param {String} message 
 * @return {discord.js.Message} sent message
 */
exports.sendMessageToChannel = async (client, guildID, chid, message) => {
  while (true) {
    let guild = await this.getGuildFromID(client, guildID).catch(console.error);
    if (guild) {
      let channel = await this.getChannelFromID(guild, chid).catch(console.error);
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
exports.editMessageInChannel = async (client, guildID, chid, msgid, content) => {
  let guild = await this.getGuildFromID(client, guildID).catch(console.error);
  let fetchedMsg = await this.getMessageFromID(guild, chid, msgid);

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
exports.getGuildFromID = async (client, guildID) => {
  return await client.guilds.cache.get((g) => g.id == guildID) ||
    await client.guilds.fetch(guildID).catch(console.error);
}

/**
 * returns Channel instance using its ID
 * @param {discord.js.Guild} guild 
 * @param {Snowflake} channelID 
 * @returns {discord.js.Channel}
 */
exports.getChannelFromID = async (guild, channelID) => {
  let channel;
  try {
    channel = await guild.channels.cache.get(channelID);
  }
  catch (e) {
    channel = await guild.channels.fetch(channelID).catch(console.error);
  }
  finally {
    return channel;
  }
}

/**
 * checks if given GuildMember has the given Role
 * @param {discord.js.GuildMember} gm 
 * @param {discord.js.Role} role 
 * @returns {Boolean}
 */
exports.guildMemberHasRole = async (gm, role) => {  
  if (gm && role) {
    return (gm._roles.includes(role));
  }
  return false;
}

/**
 * adds the given Role to the given User
 * @param {discord.js.User} user 
 * @param {discord.js.Guild} guild 
 * @param {discord.js.Role} role 
 */
exports.addRoleToUser = async (user, guild, role) => {
  let gm = await this.getGuildMemberfromID(user.id, guild).catch(console.error);
  if (gm != undefined && !(await this.guildMemberHasRole(gm, role).catch(console.error))) { // if member already has role, then do not put the role
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
exports.removeRoleToUser = async (user, guild, role) => {
  let gm = await this.getGuildMemberfromID(user.id, guild).catch(console.error);
  if (gm != undefined && await this.guildMemberHasRole(gm, role).catch(console.error)) { // if member already has role, then do not put the role
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
exports.getEmojiInstance = async (name, client, guildID) => {
  let guild = await this.getGuildFromID(client, guildID).catch(console.error);
  if (guild != undefined) {
    return guild.emojis.cache.get((e) => e.name == name);
  }
}

/**
 * returns a message instance from the given message id
 * @param {discord.js.Guild} guild: guild instance
 * @param {String} chid: channel id
 * @param {String} msgid: message id
 * @returns {discord.js.Message}
 */
exports.getMessageFromID = async (guild, chid, msgid) => {
  let channel = await this.getChannelFromID(guild, chid).catch(console.error);
  return channel.messages.cache.get(msgid) ||
    await channel.messages.fetch(msgid).catch(console.error);
}

/**
 * does the replies and logging after user interactions
 * @param {discord.js.Interaction} interaction 
 * @param {Boolean} success 
 * @param {String} content 
 * @param {Boolean} isModal
 * @param {discord.js.Modal} modal
 */
exports.postProcess = async (interaction, success, content, isModal, modal) => {
  if (!success)
    await this.sendMessageToChannel(interaction.client, interaction.guild.id, channelsID.keebotlogs, `<@${interaction.user.id}>\n${content}`);
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
 * @param {discord.js.Client} client 
 * @param {Snowflake} guildID 
 * @param {Snowflake} chid : Channel ID
 * @param {Snowflake} msgid: Message ID
 * @return {Boolean}: if sent successfully
 */
exports.makeMessageSpoiler = async (client, guildID, chid, msgid) => {
  let guild = await this.getGuildFromID(client, guildID).catch(console.error);
  let fetchedMsg = await this.getMessageFromID(guild, chid, msgid);

  if (fetchedMsg) {
    let response = await fetchedMsg.edit(`||${fetchedMsg.content}||`).catch(console.error);
    if (response) return true;
  }
  return false;
}


/**
 * Returns the ID of the message to which msgid replied to
 * @param {discord.js.Client} client 
 * @param {Snowflake} guildID 
 * @param {Snowflake} chid : Channel ID
 * @param {Snowflake} msgid: Message ID
 * @return {Snowflake}: ID of message replied to
 */
exports.getIdOfRepliedMsg = async (guild, chid, msgid) => {
  let reply = await this.getMessageFromID(guild, chid, msgid);
  let origpost = await reply.fetchReference();
  if (origpost) return origpost.id;
}

/**
 * returns true if user is a mod of the guild
 * @param {discord.js.Guild} guild 
 * @param {discord.js.User} user 
 * @returns {boolean}
 */
exports.isMod = async (guild, userID) => {
  let gm = await this.getGuildMemberfromID(userID, guild).catch(console.error);
  let result = this.guildMemberHasRole(gm, modRole.id);
  return result;
}

exports.isServiceProvider = async (guild, userID) => {
  let gm = await this.getGuildMemberfromID(userID, guild).catch(console.error);
  return this.guildMemberHasRole(gm, serviceProviderRole.id);
}

/**
 * returns the User instance of using ID
 * @param {Discord.js.Client} client 
 * @param {Snowflake} userID 
 * @returns {Discord.js.User}
 */
exports.getUserFromID = async (client, userID) => {
  return await client.users.fetch(userID);
}

exports.fetchAllMessagesMentionsUser = async (client, guild, userID, channelID) => {
  const channel = await this.getChannelFromID(guild, channelID);
  let hasMoreMessages = true;
  let lastMessageID;
  let userMentionsMessages = [];

  while (hasMoreMessages) {
    let options = { limit: 100 };
    if (lastMessageID) options.before = lastMessageID;

    const messages = await channel.messages.fetch(options).catch(console.error);
    if(messages.length == 0) break;

    messages.forEach(msg => {
      console.log(msg);
      if(msg.mentions.users.has(userID))
        userMentionsMessages.push(msg);
      lastMessageID = msg.id;
    });

    if (messages.length % 100 != 0) hasMoreMessages = false;
  }
  return userMentionsMessages;
}