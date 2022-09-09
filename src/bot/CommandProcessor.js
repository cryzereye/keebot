const { MessageEmbed } = require('discord.js');
const { commands, me_id, botCHID, verifyCHID } = require('../json/config.json');
const { MessageExtractor } = require('../util/MessageExtractor');

class CommandProcessor {
  constructor(client, dbmngr) {
    this.client = client;
    this.dbmngr = dbmngr;
  }

  async processCommand(interaction, scorer, rolegivermngr) {
    const { commandName, user } = interaction;
    let fullName = `${user.username}#${user.discriminator}`;
    let interactionCHID = interaction.channel.id;

    let result = "";
    if (interactionCHID != botCHID && interaction.user.id != me_id) return await interaction.reply(`Use commands in <#${botCHID}>`);
    switch (commandName) {
      case commands[0].name: {
        const target = interaction.options.getUser('user');
        if (target)
          return scorer.getStatsEmbed(interaction, target);
        return scorer.getStatsEmbed(interaction, user);
      }
      case commands[1].name: {
        console.log('Checking if admin...');
        if (user.id != me_id)
          return await interaction.reply(`Command not available for ${fullName}`).catch(console.error);
        if (interaction.channel.id != verifyCHID)
          return await interaction.reply(`Do /extract in #verify-transaction`).catch(console.error);
        console.log('Data extraction from #verify-transactions starting...');
        let extractor = new MessageExtractor();
        if(await extractor.extractAllVouches(this.dbmngr)){
          console.log('Extraction completed successfully');
          if(await scorer.refreshScoresFromDB())
            console.log("Score refresh done successfully");
        }
        return;
      }
      case commands[2].name: {
        return await interaction.reply({ embeds: [this.generateHelp(fullName)] }).catch(console.error);
      }
    }
    if (result == "")
      result = `No results for command ${commandName}`;
    await interaction.reply(result).catch(console.error);
  }

  generateHelp(username) {
    const verifyHelp = `This is where you send vouches for the people that you have transacted with **within the server**. For vouch confirmation, please reply to the vouch where you got mentioned, else you would not be scored for it.`;
    const statsHelp = `/stats <optional user>: see your stats or your target user's stats`;
    const extractHelp = `For admin use only`;
    const bugsHelp = `Please DM <@${me_id}>`;
    const embedBuilder = new MessageEmbed()
      .setColor("DEFAULT")
      .setTitle(`Help | ${username}`)
      .addFields({ name: '#verify-transaction:', value: verifyHelp })
      .addFields({ name: '/stats:', value: statsHelp })
      .addFields({ name: '/extract:', value: extractHelp })
      .addFields({ name: 'For bugs and data in accuracies', value: bugsHelp });

    return embedBuilder;
  }
}
module.exports = { CommandProcessor }