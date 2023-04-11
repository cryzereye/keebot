import { MessageContextMenuCommandInteraction } from "discord.js";
import { BaseProcessor } from "./BaseProcessor";
import { PostResult } from "./types/PostResult";

const { commands } = require('../globals/commands.json');

export class ContextProcessor extends BaseProcessor {
  constructor() {
    super();
  }

  async processContext(interaction: MessageContextMenuCommandInteraction) {
    const { commandName } = interaction;
    switch (commandName) {
      case commands[5].name:
      case commands[6].name:
      case commands[7].name: this.processResults(interaction, await globalThis.postfactory.processContext(interaction)); break;
      case commands[8].name: this.processResults(interaction, await globalThis.reportmngr.reportPost(interaction)); break;
    }
  }

  /**
 * does the results processing for all modal functions
 * @param {discord.js.Interaction} interaction 
 * @param {Object} data 
 */
  processResults(interaction: MessageContextMenuCommandInteraction, data: PostResult) {
    const { success, content, isModal, modal } = data;
    this.dUtil.postProcess(interaction, success, content, isModal, modal);
  }
}