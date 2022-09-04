/**
 * returns the GuildMember equivalent of ID given
 * @param {Snowflake} id : User id
 * @param {discord.js.Guild} guild 
 * @returns {discord.js.GuildMember}
 */
exports.getGuildMemberfromID = async(id, guild) => {
  return await guild.members.cache.find((gm) => gm.id == id) ||
          await guild.members.resolveID(id) ||
          await guild.members.fetch(id);
}

/**
 * sends message to target channel (id). client and guild instances are required
 * @param {discord.js.Client} client 
 * @param {Snowflake} guildID 
 * @param {Snowflake} chid 
 * @param {String} message 
 */
exports.sendMessageToChannel = async(client, guildID, chid, message) => {
  let guild = getGuildFromID(client, guildID);
  let channel = getChannelFromID(guild, chid);
  await channel.sendMessage(message);
}

/**
 * gets guild instance from ID
 * @param {discord.js.} client 
 * @param {Snowflake} guildID 
 * @returns {discord.js.Guild}
 */
exports.getGuildFromID = async(client, guildID) => {
  return await client.guilds.cache.find((g) => g.id == guildID) ||
          await client.guilds.resolveID(guildID) ||
          await client.guilds.fetch(guildID);
}

/**
 * returns Channel instance using its ID
 * @param {discord.js.Guild} guild 
 * @param {Snowflake} channelID 
 * @returns {discord.js.Channel}
 */
exports.getChannelFromID = async(guild, channelID) => {
  return await guild.channels.cache.find((ch) => ch.id == channelID) ||
          await guild.channels.resolveID(channelID) ||
          await guild.channels.fetch(channelID);
}

/**
 * checks if given GuildMember has the given Role
 * @param {discord.js.GuildMember} gm 
 * @param {discord.js.Role} role 
 * @returns {Boolean}
 */
exports.guildMemberHasRole = async(gm, role) => {
  if(gm != undefined && role != undefined) {
    if(gm.roles.cache.find(r => r.name === role.name))
      return true;
  }
  return false;
}