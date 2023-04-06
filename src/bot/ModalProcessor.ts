const dUtil = require('../util/DiscordUtil');

class ModalProcessor {
  constructor() { }

  async processModal(interaction, postfactory) {
    postfactory.processModal(interaction);
  }
}

module.exports = { ModalProcessor }