import { BaseInteraction, ChatInputCommandInteraction, Client, MessageContextMenuCommandInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import { PostResult } from "../../processor/types/PostResult";

import { DiscordUtilities } from "../../util/DiscordUtilities";
import { DeletePostManager } from './DeletePostManager';
import { EditPostManager } from './EditPostManager';
import { ListPostManager } from './ListPostManager';
import { NewPostManager } from './NewPostManager';
import { SoldPostManager } from './SoldPostManager';

export class PostFactory {
    private client: Client;
    private dUtil: DiscordUtilities
    private newPostManager: NewPostManager;
    private editPostManager: EditPostManager;
    private soldPostManager: SoldPostManager;
    private deletePostManager: DeletePostManager;
    private listPostManager: ListPostManager;

    constructor() {
        this.client = globalThis.CLIENT;
        this.dUtil = globalThis.DUTIL;
        this.newPostManager = new NewPostManager();
        this.editPostManager = new EditPostManager();
        this.soldPostManager = new SoldPostManager();
        this.deletePostManager = new DeletePostManager();
        this.listPostManager = new ListPostManager();
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

    async processContext(interaction: MessageContextMenuCommandInteraction): Promise<PostResult> {
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


    async processResults(interaction: BaseInteraction, data: PostResult) {
        const { success, content, isModal, modal } = data;
        this.dUtil.postProcess(interaction, success, content, isModal, modal);
    }
}