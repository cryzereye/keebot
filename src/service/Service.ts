import { Client } from "discord.js";

export class Service {
    protected client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async startService() {}
}