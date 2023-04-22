import { Snowflake } from "discord.js"

export type NotificationType = {
    userID: Snowflake;
    limit: number;
    keywords: Array<string[]>;
}