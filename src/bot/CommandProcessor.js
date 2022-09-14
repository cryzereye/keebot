const { MessageEmbed } = require('discord.js');
const { commands, me_id, botCHID, reportsCHID } = require('../json/config.json');
const { MessageExtractor } = require('../util/MessageExtractor');

class CommandProcessor {
  constructor() { }

  async processCommand(interaction, scorer, rolegivermngr, reportmngr, postmngr) {
    const { commandName, user } = interaction;
    let fullName = `${user.username}#${user.discriminator}`;
    let interactionCHID = interaction.channel.id;

    let result = "";
    if (interactionCHID != botCHID && interaction.user.id != me_id) return await interaction.reply(`Use commands in <#${botCHID}>`);
    switch (commandName) {
      case commands[0].name: {
        const target = interaction.options.getUser('user');
        if (target)
          return scorer.getStatsEmbed(interaction, target, reportmngr);
        return scorer.getStatsEmbed(interaction, user, reportmngr);
      }
      case commands[1].name: {
        console.log('Checking if admin...');
        if (user.id != me_id)
          return await interaction.reply(`Command not available for ${fullName}`).catch(console.error);
        console.log('Data extraction from #verify-transactions starting...');
        let extractor = new MessageExtractor();
        extractor.extractAllMessages(interaction.channel, scorer, rolegivermngr)
          .then(console.log('Extraction started'))
          .catch(console.error);
        return;
      }
      case commands[2].name: {
        return await interaction.reply({ embeds: [this.generateHelp(fullName)] }).catch(console.error);
      }
      case commands[3].name: {
        return await interaction.reply({
          content: await this.processReport(interaction, reportmngr),
          ephemeral: true
        });
      }
      case commands[4].name: {
        if (interaction.user.id == me_id)
          return this.processPost(interaction, postmngr);
        else 
          return await interaction.reply("**NOT YET AVAILABLE**");
      }
    }
  }

  generateHelp(username) {
    const verifyHelp = `This is where you send vouches for the people that you have transacted with **within the server**. For vouch confirmation, please reply to the vouch where you got mentioned, else you would not be scored for it.`;
    const statsHelp = `/stats <optional user>: see your stats or your target user's stats`;
    const reportsHelp = `/report file <user> <category> <summary>: file a report regarding a transaction incident within Keebisoria`;
    const extractHelp = `For admin use only`;
    const bugsHelp = `Please DM <@${me_id}>`;
    const embedBuilder = new MessageEmbed()
      .setColor("DEFAULT")
      .setTitle(`Help | ${username}`)
      .addFields({ name: '#verify-transaction:', value: verifyHelp })
      .addFields({ name: '/stats:', value: statsHelp })
      .addFields({ name: '/report file:', value: reportsHelp })
      .addFields({ name: '/extract:', value: extractHelp })
      .addFields({ name: 'For bugs and data in accuracies', value: bugsHelp });

    return embedBuilder;
  }

  async processReport(interaction, reportmngr) {
    await reportmngr.processReport(interaction);
  }

  /**
   * segregates /post usage
   * @param {discord.js.Interaction} interaction 
   * @param {postManager} postmngr 
   */
  processPost(interaction, postmngr){
    const postType = interaction.options.getSubcommand(false);
    switch(postType){
      case "new": return postmngr.newPostModal(interaction);
      case "edit": return postmngr.editPostModal(interaction);
      case "delete": return postmngr.deletePostModal(interaction);
    }
    
  }

}

module.exports = { CommandProcessor }