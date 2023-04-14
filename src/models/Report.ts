import { Snowflake } from "discord.js";
import { ReportCategory } from "./enums/ReportCategory.js";
import { ReportType } from "./types/ReportType.js";

export class Report implements ReportType {
    id: number;
    authorID: Snowflake;
    authorName: string;
    targetID: Snowflake;
    targetName: string;
    category: ReportCategory;
    summary: string;
    date: Date;
    verifiedBy: Snowflake | undefined;
    verifyDate: Date | undefined;
    verified: boolean;

    constructor(id: number, authorID: Snowflake, authorName: string, targetID: Snowflake, targetName: string, category: ReportCategory, summary: string) {
        this.id = id;
        this.authorID = authorID;
        this.authorName = authorName;
        this.targetID = targetID;
        this.targetName = targetName;
        this.category = category;
        this.summary = summary;
        this.date = new Date();
        this.verified = false;
    }

    verify(verifiedBy: Snowflake) {
        this.verifiedBy = verifiedBy;
        this.verifyDate = new Date();
        this.verified = true;
    }

    static getCategoryFromString(categoryName: string): ReportCategory {
        switch (categoryName) {
            case "Joy Reserve/Flaking": return ReportCategory.Flaking;
            case "Scamming": return ReportCategory.Scamming;
            case "Incorrect/Damaged Item": return ReportCategory.ItemIssue;
            case "Troll/False reports": return ReportCategory.Troll;
            case "Post Content Issue": return ReportCategory.PostContentIssue;
            case "Intentional Invalid Vouch": return ReportCategory.InvalidVouch;
            case "Other": return ReportCategory.Other;
        }

        return ReportCategory.Other;
    }
}