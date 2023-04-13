import { Snowflake } from "discord.js";
import { Score } from "../models/Score.js";
import { ScoreRepository } from "../repository/ScoreRepository.js";
import { Manager } from "./Manager.js";

export class ScoreManager extends Manager {
    repo: ScoreRepository;

    constructor() {
        super();
        this.repo = new ScoreRepository();
    }

    addPoint(userID: Snowflake, targetID: Snowflake, targetName: string): void {
        this.repo.updateScore(userID, targetID, targetName);
    }

    clearScores(): void {
        this.repo.clearScores();
    }

    getStats(userID: Snowflake): Score | undefined {
        const record = this.repo.find(userID);
        return (record ? record : undefined);
    }

    getScore(userID: Snowflake): number {
        const record = this.repo.find(userID);
        if (record) return record.points;
        return 0;
    }
}