import { BaseInteraction, Client } from "discord.js";
import { ManagerInterface } from "./interface/ManagerInterface";
import { DiscordUtilities } from "../util/DiscordUtilities";

export class Manager implements ManagerInterface{
    protected client: Client
    protected dUtil: DiscordUtilities;

    constructor() {
        this.client = globalThis.client;
        this.dUtil = globalThis.dUtil;
    }

    async doProcess(interaction: BaseInteraction): Promise<void>{};
}

