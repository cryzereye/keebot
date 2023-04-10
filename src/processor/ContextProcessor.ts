import { Client, MessageContextMenuCommandInteraction } from "discord.js";
import { ReportManager } from "../functions/ReportManager";
import { PostFactory } from "../functions/post/PostFactory";
import { PostResult } from "./types/PostResult";
import { BaseProcessor } from "./BaseProcessor";

const { commands } = require('../globals/commands.json');
const dUtil = require('../util/DiscordUtilities');

export class ContextProcessor extends BaseProcessor{
  private postfactory: PostFactory
  private reportmngr: ReportManager;

  constructor(client: Client, postfactory: PostFactory, reportmngr: ReportManager) {
    super(client);
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
    dUtil.postProcess(interaction, success, content, isModal, modal);
  }
}