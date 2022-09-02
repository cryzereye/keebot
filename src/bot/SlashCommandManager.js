const { ApplicationCommand } = require('discord.js');
const { commands } = require('../json/config.json');

class SlashCommandManager {
    constructor() {}

    loadCommands(client, guildID){
      console.log(client);
      client.application.commands.set(commands, guildID)
      .then(console.log("Commands loaded successfully!"))
      .catch(console.error);
    }
}

module.exports = { SlashCommandManager }