import { Client } from "discord.js";
import { ExtractManager } from "./functions/ExtractManager";
import { ReportManager } from "./functions/ReportManager";
import { RoleGiverManager } from "./functions/RoleGiverManager";
import { ScoreManager } from "./functions/ScoreManager";
import { StatsManager } from "./functions/StatsManager";
import { PostFactory } from "./functions/post/PostFactory";
import { DiscordUtilities } from "./util/DiscordUtilities";

declare global {
    var CLIENT: Client;
    var DUTIL: DiscordUtilities;
    var ROLEGIVERMNGR: RoleGiverManager;
    var SCOREMNGR: ScoreManager;
    var STATSMNGR: StatsManager;
    var EXTRACTMNGR: ExtractManager;
    var REPORTMNGR: ReportManager;
    var POSTFACTORY: PostFactory;
}