import { Snowflake } from "discord.js";
import { ReportCategory } from "../enums/ReportCategory.js";

export type ReportType = {
    id: number
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
}