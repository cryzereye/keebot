import { Snowflake } from "discord.js"
import { ReportType } from "../../functions/enums/ReportType.js"

export type Report = {
    authorID: Snowflake,
    authorName: string,
    targetID: Snowflake,
    targetName: string,
    type: ReportType,
    summary: string,
    date: string,
    verified: false
}