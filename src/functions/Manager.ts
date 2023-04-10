import { BaseInteraction, Client } from "discord.js";
import { ManagerInterface } from "./interface/ManagerInterface";
import { DiscordUtilities } from "../util/DiscordUtilities";

export class Manager implements ManagerInterface{
    protected client: Client
    protected dUtil: DiscordUtilities;

    constructor(client: Client, dUtil: DiscordUtilities) {
        this.client = client;
        this.dUtil = dUtil;
    }

    async doProcess(interaction: BaseInteraction): Promise<void>{};
}

