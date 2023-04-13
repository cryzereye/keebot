import { Score } from "../models/Score.js";
import { BaseRepository } from "./BaseRepository.js";

export class ScoreRepository extends BaseRepository {
    scores: Score[];
    constructor(file: string) {
        super(file);
        this.scores = [];
    }
}