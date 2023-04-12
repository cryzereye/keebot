import { Client } from "discord.js";
import { DiscordUtilities } from "../util/DiscordUtilities";
import { ProcessorInterface } from "./interface/ProcessorInterface";

export class BaseProcessor implements ProcessorInterface {
    protected client: Client;
    protected dUtil: DiscordUtilities;

    constructor() {
        this.client = globalThis.CLIENT;
        this.dUtil = globalThis.DUTIL;
    }

    process(): void {
        return;
    }
}