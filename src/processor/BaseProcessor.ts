import { Client } from "discord.js"
import { ProcessorInterface } from "./interface/ProcessorInterface"

export class BaseProcessor implements ProcessorInterface {
    protected client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    process(): void{}
}