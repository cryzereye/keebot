import { Client, MessageContextMenuCommandInteraction } from "discord.js";
import { ReportManager } from "../functions/ReportManager";
import { PostFactory } from "../functions/post/PostFactory";
import { PostResult } from "./types/PostResult";
import { BaseProcessor } from "./BaseProcessor";
import { DiscordUtilities } from "../util/DiscordUtilities";

const { commands } = require('../globals/commands.json');

export class ContextProcessor extends BaseProcessor{
  private postfactory: PostFactory;
  private reportmngr: ReportManager;
  private dUtil: DiscordUtilities;

  constructor(client: Client, dUtil: DiscordUtilities, postfactory: PostFactory, reportmngr: ReportManager) {
    super(client);
    this.dUtil = dUtil;
    this.postfactory = postfactory;
    this.reportmngr = reportmngr;
  }

  async processContext(interaction: MessageContextMenuCommandInteraction) {
    const { commandName } = interaction;
    switch (commandName) {
      case commands[5].name: 
      case commands[6].name: 
      case commands[7].name: this.processResults(interaction, await this.postfactory.processContext(interaction)); break;
      case commands[8].name: this.processResults(interaction, await this.reportmngr.reportPost(interaction)); break;
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