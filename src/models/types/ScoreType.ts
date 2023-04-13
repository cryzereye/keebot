import { Snowflake } from "discord.js";
import { TransactionTally } from "./TransactionTally.js";

export type ScoreType = {
    userID: Snowflake,
    points: number,
    transactions: TransactionTally[];
}