import { Client } from "discord.js";
import * as DiscordUtilities from "../util/DiscordUtilities.js";
import * as ProcessorInterface from "./interface/ProcessorInterface.js";

export class BaseProcessor implements ProcessorInterface.ProcessorInterface {
    protected client: Client;
    protected dUtil: DiscordUtilities.DiscordUtilities;

    constructor() {
        this.client = CLIENT;
        this.dUtil = DUTIL;
    }

    process(): void {
        return;
    }
}