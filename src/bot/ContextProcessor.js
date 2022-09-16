const { commands, admins } = require('../json/config.json');
class ContextProcessor {
  constructor() { }

  async processContext(interaction, postmngr) {
    const { commandName, targetId } = interaction;
    if (admins.includes(interaction.user.id)) {
      switch (commandName) {
        case commands[5].name: return await postmngr.editPostModal(interaction, targetId);
        case commands[6].name: return await postmngr.deletePostModal(interaction, targetId);
        case commands[7].name: return await postmngr.soldPostModal(interaction, targetId);
      }
    }
  }
}

module.exports = { ContextProcessor }