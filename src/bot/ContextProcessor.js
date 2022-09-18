const { admins } = require('../json/config.json');
const { commands } = require('../globals/commands.json');
class ContextProcessor {
  constructor() { }

  async processContext(interaction, postmngr, reportmngr) {
    const { commandName, targetId } = interaction;
    if (admins.includes(interaction.user.id)) {
      switch (commandName) {
        case commands[5].name: return await postmngr.editPostModal(interaction, targetId);
        case commands[6].name: return await postmngr.deletePostModal(interaction, targetId);
        case commands[7].name: return await postmngr.soldPostModal(interaction, targetId);
        case commands[8].name: return await reportmngr.reportPost(interaction, targetId);
      }
    }
  }
}

module.exports = { ContextProcessor }