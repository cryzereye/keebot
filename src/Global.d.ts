import { Client } from "discord.js";
import { ExtractManager } from "./functions/ExtractManager.js";
import { ReportManager } from "./functions/ReportManager.js";
import { RoleGiverManager } from "./functions/RoleGiverManager.js";
import { ScoreManager } from "./functions/ScoreManager.js";
import { StatsManager } from "./functions/StatsManager.js";
import { PostFactory } from "./functions/post/PostFactory.js";
import { ConfigImporter } from "./importer/ConfigImporter.ts";
import { NotificationRepository } from "./repository/NotificationRepository.ts";
import { DiscordUtilities } from "./util/DiscordUtilities.js";
import { Utilities } from "./util/Utilities.js";

export { };

declare global {
    var CLIENT: Client;
    var DUTIL: DiscordUtilities;
    var ROLEGIVERMNGR: RoleGiverManager;
    var SCOREMNGR: ScoreManager;
    var STATSMNGR: StatsManager;
    var EXTRACTMNGR: ExtractManager;
    var REPORTMNGR: ReportManager;
    var POSTFACTORY: PostFactory;
    var UTIL: Utilities;
    var CONFIG: ConfigImporter;
    var COMMANDS: Array<any>;
    var CONSTANTS: any;
    var NOTIF_REPO: NotificationRepository;
}