import { Snowflake } from "discord.js"
import { ReportCategory } from "../enums/ReportCategory.js"

export type ReportType = {
    authorID: Snowflake,
    authorName: string,
    targetID: Snowflake,
    targetName: string,
    type: ReportCategory,
    summary: string,
    date: string,
    verified: false
}