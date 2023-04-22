import { ModalSubmitInteraction } from "discord.js";
import { BaseNotificationManager } from "./BaseNotificationManager.js";

export class EditNotificationManager extends BaseNotificationManager {
    constructor() {
        super();
    }

    async doModalDataProcess(interaction: ModalSubmitInteraction): Promise<void> {
        return;
    }
}