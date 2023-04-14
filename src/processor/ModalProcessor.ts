import { ModalSubmitInteraction } from "discord.js";
import { PostFactory } from "../functions/post/PostFactory.js";
import { BaseProcessor } from "./BaseProcessor.js";

export class ModalProcessor extends BaseProcessor {
  constructor() {
    super();
  }

  public async processModal(interaction: ModalSubmitInteraction, postfactory: PostFactory) {
    postfactory.processModal(interaction);
  }
}