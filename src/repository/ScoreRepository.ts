import { Snowflake } from "discord.js";
import { Score } from "../models/Score.js";
import { BaseRepository } from "./BaseRepository.js";

export class ScoreRepository extends BaseRepository {
    cache: Array<Score>;
    constructor() {
        super(`json/scores.json`);
        this.cache = <Array<Score>>this.load();
    }

    updateScore(userID: Snowflake, targetID: Snowflake, targetName: string): void {
        const record = this.cache.find(record => record.userID === userID);
        if (record) record.addPoint(targetID, targetName);
        else this.cache.push(new Score(userID, targetID, targetName));

        this.save(JSON.stringify(this.cache));
    }

    find(userID: Snowflake): Score | undefined {
        return this.cache.find(record => record.userID === userID);
    }

    clearScores(): void {
        this.cache = new Array<Score>();
    }
}