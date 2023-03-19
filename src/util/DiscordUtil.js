const { channelsID, modRole } = require('../json/config.json');

/**
 * returns the GuildMember equivalent of ID given
 * @param {Snowflake} id : User id
 * @param {discord.js.Guild} guild 
 * @returns {discord.js.GuildMember}
 */
exports.getGuildMemberfromID = async (id, guild) => {
  return await guild.members.cache.get(id) ||
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
 * @param {discord.js.Client} client 
 * @param {Snowflake} guildID 
 * @returns {discord.js.Guild}
 */
exports.getGuildFromID = async (client, guildID) => {
  return await client.guilds.cache.get(guildID) ||
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
  if (gm != undefined && role != undefined) {
    if (gm.roles.cache.find(r => r.name === role.name))
      return true;
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
    console.log(role.name + " added from " + user.username);
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
    console.log(role.name + " removed from " + user.username);
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
    return guild.emojis.cache.get(name);
  }
}

/**
 * gets GuildMember roles and returns as 1 line string filtered by relevant_roles
 * @param {discord.js.GuildMember} gm 
 * @returns {String}
 */
exports.getRolesAsString = (gm, relevant_roles) => {
  let roles = "";
  gm.roles.cache.map((r) => {
    if (relevant_roles.includes(r.name))
      roles += `<@&${r.id}> `;
  });
  return roles;
}