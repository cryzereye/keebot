import { ModalSubmitInteraction } from "discord.js";
import { BaseNotificationManager } from "./BaseNotificationManager.js";

export class DeleteNotificationManager extends BaseNotificationManager {
    constructor() {
        super();
    }

    async doModalDataProcess(interaction: ModalSubmitInteraction): Promise<void> {
        return;
    }
}