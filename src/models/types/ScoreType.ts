import { Snowflake } from "discord.js";
import { TransactionTally } from "./TransactionTally.js";

export type ScoreType = {
    userId: Snowflake,
    points: number,
    transactions: TransactionTally[];
}