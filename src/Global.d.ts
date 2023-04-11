import { Client } from "discord.js";
import { DiscordUtilities } from "./util/DiscordUtilities";
import { ExtractManager } from "./functions/ExtractManager";
import { ReportManager } from "./functions/ReportManager";
import { RoleGiverManager } from "./functions/RoleGiverManager";
import { ScoreManager } from "./functions/ScoreManager";
import { StatsManager } from "./functions/StatsManager";
import { PostFactory } from "./functions/post/PostFactory";

declare global {
    var client: Client;
    var dUtil: DiscordUtilities;
    var rolegivermngr: RoleGiverManager;
	var scoremngr: ScoreManager;
	var statsmngr: StatsManager;
	var extractmngr: ExtractManager;
	var reportmngr: ReportManager;
    var postfactory: PostFactory;
}