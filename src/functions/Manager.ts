import { BaseInteraction, Client } from "discord.js";
import * as DiscordUtilities from "../util/DiscordUtilities.js";
import * as ManagerInterface from "./interface/ManagerInterface.js";

export class Manager implements ManagerInterface.ManagerInterface {
    protected client: Client
    protected dUtil: DiscordUtilities.DiscordUtilities;

    constructor() {
        this.client = CLIENT;
        this.dUtil = DUTIL;
    }

    async doProcess(interaction: BaseInteraction): Promise<void> {
        return;
    }
}

