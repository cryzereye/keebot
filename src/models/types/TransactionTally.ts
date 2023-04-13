import { Snowflake } from "discord.js";

export type TransactionTally = {
    userID: Snowflake;
    userName: string;
    count: number;
    lastVouchDate: Date;
}