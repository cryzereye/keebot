import { Client, ModalSubmitInteraction } from "discord.js";
import { PostFactory } from "../functions/post/PostFactory";
import { BaseProcessor } from "./BaseProcessor";

export class ModalProcessor extends BaseProcessor {
  constructor() {
    super();
  }

  public async processModal(interaction: ModalSubmitInteraction, postfactory: PostFactory) {
    postfactory.processModal(interaction);
  }
}