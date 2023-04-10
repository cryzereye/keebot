import { BaseInteraction } from "discord.js";

export interface ManagerInterface {
    doProcess(interaction: BaseInteraction): Promise<void>;
}