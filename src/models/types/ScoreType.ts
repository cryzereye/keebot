import { Snowflake } from "discord.js";
import { TransactionTally } from "./TransactionTally.js";

export type ScoreType = {
    userID: Snowflake,
    userName: string,
    points: number,
    transactions: TransactionTally[];
}