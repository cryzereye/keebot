import { Snowflake } from "discord.js";
import { NotificationType } from "./types/NotificationType.js";

export class Notification implements NotificationType {
    userID: Snowflake;
    limit: number;
    keywords: Array<string[]>;

    constructor(userID: Snowflake, keywords: string[] | undefined) {
        this.userID = userID;
        this.limit = 3;
        this.keywords = new Array<string[]>();
        if (keywords)
            this.keywords.push(keywords);
    }

    makeNoLimit(): void {
        this.limit = 0;
    }

    addKeywords(keyword: string[]): void {
        this.keywords.push(keyword);
    }

    isAllowedToAdd(): boolean {
        return (this.limit == 0 || this.keywords.length <= this.limit);
    }

    deleteKeywords(id: number): void {
        this.keywords.splice(id, 1);
    }

    editKeywords(id: number, keywords: string[]): void {
        this.keywords[id] = keywords;
    }
}