import { MessageContextMenuCommandInteraction } from "discord.js";
import { BaseProcessor } from "./BaseProcessor.js";
import { PostResult } from "./types/PostResult.js";

export class ContextProcessor extends BaseProcessor {
  constructor() {
    super();
  }

  async processContext(interaction: MessageContextMenuCommandInteraction) {
    const { commandName } = interaction;
    switch (commandName) {
      case COMMANDS.data[5].name:
      case COMMANDS.data[6].name:
      case COMMANDS.data[7].name: this.processResults(interaction, await POSTFACTORY.processContext(interaction)); break;
      case COMMANDS.data[8].name: this.processResults(interaction, await REPORTMNGR.reportPost(interaction)); break;
    }
  }

  processResults(interaction: MessageContextMenuCommandInteraction, data: PostResult) {
    const { success, content, isModal, modal } = data;
    DUTIL.postProcess(interaction, success, content, isModal, modal);
  }
}