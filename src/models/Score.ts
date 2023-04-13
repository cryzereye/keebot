import { Snowflake } from "discord.js";
import { ScoreType } from "./types/ScoreType.js";
import { TransactionTally } from "./types/TransactionTally.js";

export class Score implements ScoreType {
    userID: Snowflake;
    points: number;
    transactions: Array<TransactionTally>;

    constructor(userID: Snowflake, targetID: Snowflake, targetName: string) {
        this.userID = userID;
        this.points = 1;
        this.transactions = new Array<TransactionTally>;
        this.transactions.push({
            userID: targetID,
            userName: targetName,
            count: 1,
            lastVouchDate: new Date()
        });
    }

    addPoint(targetID: Snowflake, targetName: string) {
        const index = this.transactions.findIndex(t => t.userID === targetID);
        const record: TransactionTally = {
            userID: this.transactions[index].userID,
            userName: targetName,
            count: this.transactions[index].count++,
            lastVouchDate: new Date()
        }

        this.points++;
        this.transactions[index] = record;
    }
}