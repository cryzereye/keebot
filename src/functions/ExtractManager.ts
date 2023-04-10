import { ChatInputCommandInteraction, Client, Snowflake } from "discord.js";
import { Manager } from "./Manager";
import { RoleGiverManager } from "./RoleGiverManager";
import { DiscordUtilities } from "../util/DiscordUtilities";

const { channelsID } = require('../../json/config.json');

export class ExtractManager extends Manager {
    constructor(client: Client, dUtil: DiscordUtilities) {
        super(client, dUtil);
    }

    async doProcess(): Promise<void> {

    }

    async doExtract(interaction: ChatInputCommandInteraction, rolegivermngr: RoleGiverManager) {
        const { guild } = interaction;
        if (!guild) return;
        let vouchChannel = dUtil.getChannelFromID(guild, channelsID.verify);

    }
}