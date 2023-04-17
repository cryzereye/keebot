import { MessageContextMenuCommandInteraction } from "discord.js";
import { BaseProcessor } from "./BaseProcessor.js";

export class ContextProcessor extends BaseProcessor {
  constructor() {
    super();
  }

  async processContext(interaction: MessageContextMenuCommandInteraction) {
    const { commandName } = interaction;
    switch (commandName) {
      case COMMANDS[5].name:
      case COMMANDS[6].name:
      case COMMANDS[7].name: await POSTFACTORY.processContext(interaction); break;
      case COMMANDS[8].name: await REPORTMNGR.reportPost(interaction); break;
    }
  }
}