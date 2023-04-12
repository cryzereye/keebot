import { BaseInteraction, Client } from "discord.js";
import { DiscordUtilities } from "../util/DiscordUtilities";
import { ManagerInterface } from "./interface/ManagerInterface";

export class Manager implements ManagerInterface {
    protected client: Client
    protected dUtil: DiscordUtilities;

    constructor() {
        this.client = globalThis.CLIENT;
        this.dUtil = globalThis.DUTIL;
    }

    async doProcess(interaction: BaseInteraction): Promise<void> {
        return;
    }
}

