import { BaseInteraction, ChatInputCommandInteraction, Client, MessageContextMenuCommandInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import * as PostResult from "../../processor/types/PostResult.js";

import * as DiscordUtilities from "../../util/DiscordUtilities.js";
import * as DeletePostManager from './DeletePostManager.js';
import * as EditPostManager from './EditPostManager.js';
import * as ListPostManager from './ListPostManager.js';
import * as NewPostManager from './NewPostManager.js';
import * as SoldPostManager from './SoldPostManager.js';

export class PostFactory {
    private client: Client;
    private dUtil: DiscordUtilities.DiscordUtilities
    private newPostManager: NewPostManager.NewPostManager;
    private editPostManager: EditPostManager.EditPostManager;
    private soldPostManager: SoldPostManager.SoldPostManager;
    private deletePostManager: DeletePostManager.DeletePostManager;
    private listPostManager: ListPostManager.ListPostManager;

    constructor() {
        this.client = globalThis.CLIENT;
        this.dUtil = globalThis.DUTIL;
        this.newPostManager = new NewPostManager.NewPostManager();
        this.editPostManager = new EditPostManager.EditPostManager();
        this.soldPostManager = new SoldPostManager.SoldPostManager();
        this.deletePostManager = new DeletePostManager.DeletePostManager();
        this.listPostManager = new ListPostManager.ListPostManager();
    }

    async processCommand(interaction: ChatInputCommandInteraction) {
        const postType = interaction.options.getSubcommand(false);
        switch (postType) {
            case "new": this.processResults(interaction, await this.newPostManager.doModal(interaction)); break;
            case "list": this.processResults(interaction, await this.listPostManager.doProcess(interaction));
        }
    }

    async processModal(interaction: ModalSubmitInteraction) {
        switch (interaction.customId) {
            case "buyPostModal":
            case "sellPostModal":
            case "tradePostModal": this.newPostManager.doModalDataProcess(interaction); break;
            case "editPostModal": this.editPostManager.doModalDataProcess(interaction); break;
            case "soldPostModal": this.soldPostManager.doModalDataProcess(interaction); break;
            case "deletePostModal": this.deletePostManager.doModalDataProcess(interaction); break;
        }
    }

    async processContext(interaction: MessageContextMenuCommandInteraction): Promise<PostResult.PostResult> {
        const { commandName, targetId } = interaction;

        switch (commandName) {
            case "edit": this.processResults(interaction, await this.editPostManager.doModal(interaction, targetId)); break;
            case "sold": this.processResults(interaction, await this.soldPostManager.doModal(interaction, targetId)); break;
            case "delete": this.processResults(interaction, await this.deletePostManager.doModal(interaction, targetId)); break;
        }

        return {
            success: false,
            content: "",
            isModal: false,
            modal: new ModalBuilder
        };
    }


    async processResults(interaction: BaseInteraction, data: PostResult.PostResult) {
        const { success, content, isModal, modal } = data;
        this.dUtil.postProcess(interaction, success, content, isModal, modal);
    }
}