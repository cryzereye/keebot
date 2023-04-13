import { MessageContextMenuCommandInteraction } from "discord.js";
import * as BaseProcessor from "./BaseProcessor.js";
import * as PostResult from "./types/PostResult.js";

import { commands } from '../globals/commands.json';

export class ContextProcessor extends BaseProcessor.BaseProcessor {
  constructor() {
    super();
  }

  async processContext(interaction: MessageContextMenuCommandInteraction) {
    const { commandName } = interaction;
    switch (commandName) {
      case commands[5].name:
      case commands[6].name:
      case commands[7].name: this.processResults(interaction, await globalThis.POSTFACTORY.processContext(interaction)); break;
      case commands[8].name: this.processResults(interaction, await globalThis.REPORTMNGR.reportPost(interaction)); break;
    }
  }

  /**
 * does the results processing for all modal functions
 * @param {discord.js.Interaction} interaction 
 * @param {Object} data 
 */
  processResults(interaction: MessageContextMenuCommandInteraction, data: PostResult.PostResult) {
    const { success, content, isModal, modal } = data;
    this.dUtil.postProcess(interaction, success, content, isModal, modal);
  }
}