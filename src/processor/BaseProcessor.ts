import { Client } from "discord.js";
import { DiscordUtilities } from "../util/DiscordUtilities";
import { ProcessorInterface } from "./interface/ProcessorInterface";

export class BaseProcessor implements ProcessorInterface {
    protected client: Client;
    protected dUtil: DiscordUtilities;

    constructor() {
        this.client = globalThis.client;
        this.dUtil = globalThis.dUtil;
    }

    process(): void { }
}