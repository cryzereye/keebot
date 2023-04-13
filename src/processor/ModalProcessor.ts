import { ModalSubmitInteraction } from "discord.js";
import * as PostFactory from "../functions/post/PostFactory.js";
import * as BaseProcessor from "./BaseProcessor.js";

export class ModalProcessor extends BaseProcessor.BaseProcessor {
  constructor() {
    super();
  }

  public async processModal(interaction: ModalSubmitInteraction, postfactory: PostFactory.PostFactory) {
    postfactory.processModal(interaction);
  }
}