import { BaseInteraction, ChatInputCommandInteraction, ModalSubmitInteraction } from "discord.js";
import { NotificationModal } from "../modals/NotificationModal.js";
import { BaseNotificationManager } from "./BaseNotificationManager.js";

export class NewNotificationManager extends BaseNotificationManager {
    constructor() {
        super();
    }

    async doProcess(interaction: BaseInteraction): Promise<void> {
        if (interaction instanceof ChatInputCommandInteraction) {
            const { user, guild } = interaction;
            if (!(user && guild)) return;


            await interaction.showModal(new NotificationModal());
        }
    }

    async processModal(interaction: ChatInputCommandInteraction): Promise<void> {
        return;
    }

    async doModalDataProcess(interaction: ModalSubmitInteraction): Promise<void> {
        return;
    }
}