const { serverID } = require('../json/config.json');
exports.getGMfromUser = async(user) => {

}

exports.sendMessageToChannel = async(client, chid, message) => {
  let guild = await client.guilds.cache.find((g) => g.id == serverID) ||
              await client.guilds.resolveID(serverID) ||
              await client.guilds.fetch(serverID);
  
  let channel = await guild.channels.cache.find((ch) => ch.id == chid) ||
                await guild.channels.resolveID(chid) ||
                await guild.channels.fetch(chid);
  await channel.sendMessage(message);
}