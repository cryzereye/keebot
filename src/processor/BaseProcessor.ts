import { Client } from "discord.js";
import * as DiscordUtilities from "../util/DiscordUtilities.js";
import * as ProcessorInterface from "./interface/ProcessorInterface.js";

export class BaseProcessor implements ProcessorInterface.ProcessorInterface {
    protected client: Client;
    protected dUtil: DiscordUtilities.DiscordUtilities;

    constructor() {
        this.client = globalThis.CLIENT;
        this.dUtil = globalThis.DUTIL;
    }

    process(): void {
        return;
    }
}