import { BaseInteraction, ChatInputCommandInteraction, MessageContextMenuCommandInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import { PostResult } from "../../processor/types/PostResult.js";
import { PostRepository } from "../../repository/PostRepository.js";
import { DeletePostManager } from './DeletePostManager.js';
import { EditPostManager } from './EditPostManager.js';
import { ListPostManager } from './ListPostManager.js';
import { NewPostManager } from './NewPostManager.js';
import { SoldPostManager } from './SoldPostManager.js';

export class PostFactory {
    repo: PostRepository;
    private newPostManager: NewPostManager;
    private editPostManager: EditPostManager;
    private soldPostManager: SoldPostManager;
    private deletePostManager: DeletePostManager;
    private listPostManager: ListPostManager;

    constructor() {
        this.repo = new PostRepository();
        this.newPostManager = new NewPostManager(this.repo);
        this.editPostManager = new EditPostManager(this.repo);
        this.soldPostManager = new SoldPostManager(this.repo);
        this.deletePostManager = new DeletePostManager(this.repo);
        this.listPostManager = new ListPostManager(this.repo);
    }

    async processCommand(interaction: ChatInputCommandInteraction) {
        const postType = interaction.options.getSubcommand(false);
        switch (postType) {
            case "new": {
                await this.newPostManager.processModal(interaction);
                break;
            }
            case "list": await this.listPostManager.processResults(interaction);
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
            case "edit": this.editPostManager.processModal(interaction, targetId); break;
            case "sold": this.processResults(interaction, await this.soldPostManager.doModal(interaction, targetId)); break;
            case "delete": this.deletePostManager.processModal(interaction, targetId); break;
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
        DUTIL.postProcess(interaction, success, content, isModal, modal);
    }
}