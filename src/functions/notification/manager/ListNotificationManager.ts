import { ChatInputCommandInteraction } from "discord.js";
import { BaseNotificationManager } from "./BaseNotificationManager.js";

export class ListNotificationManager extends BaseNotificationManager {
    constructor() {
        super();
    }

    async processResults(interaction: ChatInputCommandInteraction): Promise<void> {
        return;
    }
}