import { ChatInputCommandInteraction, ModalSubmitInteraction } from "discord.js";
import { NotificationRepository } from "../../repository/NotificationRepository.js";
import { DeleteNotificationManager } from './manager/DeleteNotificationManager.js';
import { EditNotificationManager } from './manager/EditNotificationManager.js';
import { ListNotificationManager } from './manager/ListNotificationManager.js';
import { NewNotificationManager } from './manager/NewNotificationManager.js';

export class NotificationFactory {
    private newNotifManager: NewNotificationManager;
    private editNotifManager: EditNotificationManager;
    private deleteNotifManager: DeleteNotificationManager;
    private listNotifManager: ListNotificationManager;

    constructor() {
        globalThis.NOTIF_REPO = new NotificationRepository();
        this.newNotifManager = new NewNotificationManager();
        this.editNotifManager = new EditNotificationManager();
        this.deleteNotifManager = new DeleteNotificationManager();
        this.listNotifManager = new ListNotificationManager();
    }

    async processCommand(interaction: ChatInputCommandInteraction) {
        const postType = interaction.options.getSubcommand(false);
        switch (postType) {
            case "new": {
                await this.newNotifManager.processModal(interaction);
                break;
            }
            case "list": await this.listNotifManager.processResults(interaction);
        }
    }

    async processModal(interaction: ModalSubmitInteraction) {
        switch (interaction.customId) {
            case "newNotifModal": this.newNotifManager.doModalDataProcess(interaction); break;
            case "editNotifModal": this.editNotifManager.doModalDataProcess(interaction); break;
            case "deleteNotifModal": this.deleteNotifManager.doModalDataProcess(interaction); break;
        }
    }
}