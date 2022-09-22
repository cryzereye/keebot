const { commands } = require('../globals/commands.json');
const dUtil = require('../util/DiscordUtil');

class ContextProcessor {
  constructor() { }

  async processContext(interaction, postmngr, reportmngr) {
    const { commandName, targetId } = interaction;
    switch (commandName) {
      case commands[5].name: this.processResults(interaction, await postmngr.editPostModal(interaction, targetId)); break;
      case commands[6].name: this.processResults(interaction, await postmngr.deletePostModal(interaction, targetId)); break;
      case commands[7].name: this.processResults(interaction, await postmngr.soldPostModal(interaction, targetId)); break;
      case commands[8].name: this.processResults(interaction, await reportmngr.reportPost(interaction, targetId)); break;
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

module.exports = { ContextProcessor }