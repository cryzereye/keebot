const dUtil = require('../util/DiscordUtil');

export class ModalProcessor {
  constructor() { }

  public async processModal(interaction, postfactory) {
    postfactory.processModal(interaction);
  }
}