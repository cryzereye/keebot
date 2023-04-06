const { NewPostManager } = require('./NewPostManager');
const { EditPostManager } = require('./EditPostManager');
const { SoldPostManager } = require('./SoldPostManager');
const { DeletePostManager } = require('./DeletePostManager');
const { ListPostManager } = require('./ListPostManager');

export class PostFactory {
    constructor(client) {
        this.newPostManager = new NewPostManager(client);
        this.editPostManager = new EditPostManager(client);
        this.soldPostManager = new SoldPostManager(client);
        this.deletePostManager = new DeletePostManager(client);
        this.listPostManager = new ListPostManager(client);
    }

    async processCommand(interaction) {
        const postType = interaction.options.getSubcommand(false);
        switch (postType) {
            case "new": this.processResults(interaction, await this.newPostManager.doModal(interaction)); break;
            case "edit": this.processResults(interaction, await this.editPostManager.doModal(interaction)); break;
            case "sold": this.processResults(interaction, await this.soldPostManager.doModal(interaction)); break;
            case "delete": this.processResults(interaction, await this.deletePostManager.doModal(interaction)); break;
            case "list": this.processResults(interaction, await this.listPostManager.doProcess(interaction)); break;
        }
    }

    async processModal(interaction) {
        switch (interaction.customId) {
            case "buyPostModal":
            case "sellPostModal":
            case "tradePostModal": this.newPostManager.doModalDataProcess(interaction); break;
            case "editPostModal": this.editPostManager.doModalDataProcess(interaction); break;
            case "soldPostModal": this.soldPostManager.doModalDataProcess(interaction); break;
            case "deletePostModal": this.deletePostManager.doModalDataProcess(interaction); break;
        }
    }

    /**
     * does the results processing for all modal functions
     * @param {discord.js.Interaction} interaction 
     * @param {Object} data 
     */
    processResults(interaction, data) {
        const { success, content, isModal, modal } = data;
        dUtil.postProcess(interaction, success, content, isModal, modal);
    }
}