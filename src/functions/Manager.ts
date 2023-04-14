import { BaseInteraction } from "discord.js";
import { ManagerInterface } from "./interface/ManagerInterface.js";

export class Manager implements ManagerInterface {
    constructor() {
        return;
    }

    async doProcess(interaction: BaseInteraction): Promise<void> {
        return;
    }
}

