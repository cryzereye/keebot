const { EmbedBuilder } = require('discord.js');
const { me_id, admins, channelsID } = require('../../json/config.json');
const { commands } = require('../globals/commands.json');
const { MessageExtractor } = require('../util/MessageExtractor');
const dUtil = require('../util/DiscordUtil');

class CommandProcessor {
  constructor() { }

  async processCommand(interaction, scorer, rolegivermngr, reportmngr, postmngr) {
    const { commandName, user, guild } = interaction;
    let fullName = `${user.username}#${user.discriminator}`;
    let interactionCHID = interaction.channel.id;

    if (interactionCHID != channelsID.bot && !dUtil.isMod(guild, user.id)) return await interaction.reply(`Use commands in <#${channelsID.bot}>`);
    switch (commandName) {
      case commands[0].name: {
        const target = interaction.options.getUser('user');
        if (target)
          return scorer.getStatsEmbed(interaction, target, reportmngr);
        return scorer.getStatsEmbed(interaction, user, reportmngr);
      }
      case commands[1].name: {
        console.log(`[${new Date().toLocaleString()}] Checking if admin...`);
        if (!dUtil.isMod(guild, user.id))
          return await interaction.reply(`Command not available for ${fullName}`).catch(console.error);
        console.log(`[${new Date().toLocaleString()}] Data extraction from #verify-transactions starting...`);
        let extractor = new MessageExtractor();
        extractor.extractAllMessages(interaction.channel, scorer, rolegivermngr)
          .then(console.log(`[${new Date().toLocaleString()}] Extraction started`))
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
        return this.processPost(interaction, postmngr);
      }
    }
  }

  generateHelp(username) {
    const verifyHelp = `This is where you send vouches for the people that you have transacted with **within the server**. For vouch confirmation, please reply to the vouch where you got mentioned, else you would not be scored for it.`;
    const statsHelp = `/stats <optional user>: see your stats or your target user's stats`;
    const reportsHelp = `/report file <user> <category> <summary>: file a report regarding a transaction incident within Keebisoria`;
    const postNewHelp = `/post new <buy/sell/trade> <optional item role>: lets you create a new buy/sell/trade post. If item role is entered, there will be an item role ping for you listing upon creation. **Note** that the ID that will be given afterwards is your reference ID for your post`;
    const postListHelp = `/post list <optional user> <optional item role>: Lets you see your own posts list. You can also add <user> to see the posts of the target user, or add <item role> to see items under the given item role. Both can be used at the same time.`;
    const extractHelp = `For admin use only`;
    const bugsHelp = `DM <@${me_id}>`;
    const embedBuilder = new EmbedBuilder()
      .setColor("Default")
      .setTitle(`Help | ${username}`)
      .addFields({ name: '#verify-transaction:', value: verifyHelp })
      .addFields({ name: '/stats:', value: statsHelp })
      .addFields({ name: '/report file:', value: reportsHelp })
      .addFields({ name: '/post new:', value: postNewHelp })
      .addFields({ name: '/post list:', value: postListHelp })
      .addFields({ name: '/extract:', value: extractHelp })
      .addFields({ name: 'For bugs and data in accuracies', value: bugsHelp });

    return embedBuilder;
  }

  async processReport(interaction, reportmngr) {
    return await reportmngr.processReport(interaction);
  }

  /**
   * segregates /post usage
   * @param {discord.js.Interaction} interaction 
   * @param {postManager} postmngr 
   */
  async processPost(interaction, postmngr) {
    const postType = interaction.options.getSubcommand(false);
    switch (postType) {
      case "new": this.processResults(interaction, await postmngr.newPostModal(interaction)); break;
      case "edit": this.processResults(interaction, await postmngr.editPostModal(interaction, "")); break;
      case "sold": this.processResults(interaction, await postmngr.soldPostModal(interaction, "")); break;
      case "delete": this.processResults(interaction, await postmngr.deletePostModal(interaction, "")); break;
      case "list": this.processResults(interaction, await postmngr.listPost(interaction)); break;
    }

  }

  /**
   * does the results processing for all modal functions
   * @param {discord.js.Interaction} interaction 
   * @param {Object} data 
   */
  processResults(interaction, data) {
    const { success, content, isModal, modal } = data;
    dUtil.postProcess(interaction, success, content, isModal, modal);
  }

}

module.exports = { CommandProcessor }