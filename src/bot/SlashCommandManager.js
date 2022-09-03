const { commands, me_id } = require('../json/config.json');
const { MessageExtractor } = require('../util/MessageExtractor');

class SlashCommandManager {
    constructor() {}

    async processCommand(interaction, scorer, rolegivermngr){
      const { commandName, user } = interaction;
      let fullName = `${user.username}#${user.discriminator}`;
      let result = "";
      switch(commandName){
        case commands[0].name: {
          const target = interaction.options.getUser('user');
          if(target){
            let targetName = `${target.username}#${target.discriminator}`;
            return scorer.getStatsEmbed(interaction, target);
          }
          else {
            return scorer.getStatsEmbed(interaction, user);
          }
        }
        case commands[1].name: {
          console.log('Checking if admin...');
          if(user.id != me_id)
            return await interaction.reply(`Command not available for ${fullName}`);
          console.log('Data extraction from #verify-transactions starting...');
          let extractor = new MessageExtractor();
          extractor.extractAllMessages(interaction.channel, scorer, rolegivermngr)
            .then(console.log('Extraction complete!!!'))
            .catch(console.error);
          break;
        }
        case commands[2].name: {
          break;
        }
      }
      if(result == "")
        result = `No results for command ${commandName}`;
      await interaction.reply(result);
    }
}

module.exports = { SlashCommandManager }