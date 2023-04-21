import { BaseInteraction, ChatInputCommandInteraction } from "discord.js";
import { Manager } from "./Manager.js";
import { NotificationModal } from "./modal/NotificationModal.js";

export class NotificationManager extends Manager{
    constructor() {
        super();
    }

    async doProcess(interaction: BaseInteraction): Promise<void> {
		if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.showModal(new NotificationModal());
        }
    }
}