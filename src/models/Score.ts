import { Snowflake } from "discord.js";
import { ScoreType } from "./types/ScoreType.js";
import { TransactionTally } from "./types/TransactionTally.js";

export class Score implements ScoreType {
    userID: Snowflake;
    userName: string;
    points: number;
    transactions: Array<TransactionTally>;

    constructor(userID: Snowflake, userName: string, targetID: Snowflake, targetName: string) {
        this.userID = userID;
        this.userName = userName;
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
        const index = this.transactions.findIndex(t => t.userID == targetID);
        const record = {
            userID: targetID,
            userName: targetName,
            count: 1,
            lastVouchDate: new Date()
        };

        if (index == -1) {
            this.transactions.push(record);
        }
        else {
            record.count = this.transactions[index].count + 1;
            this.transactions[index] = record;

        }
        this.points++;
    }
}