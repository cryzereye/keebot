import { Client } from "discord.js"
import { ProcessorInterface } from "./interface/ProcessorInterface"
import { DiscordUtilities } from "../util/DiscordUtilities";

export class BaseProcessor implements ProcessorInterface {
    protected client: Client;
    protected dUtil: DiscordUtilities;

    constructor() {
        this.client = globalThis.client;
        this.dUtil = globalThis.dUtil;
    }

    process(): void{}
}