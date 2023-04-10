import { Client, Message, Role } from "discord.js";
import { Manager } from "./Manager";
import { DiscordUtilities } from "../util/DiscordUtilities";

const { roles } = require('../../json/config.json');

export class RoleGiverManager extends Manager {
	constructor(client: Client, dUtil: DiscordUtilities) {
		super(client, dUtil);
	}

	async roleCheck(userScore: number, message: Message) {
		let len = roles.length;
		for (let i = 0; i < len; i++) {
			if (userScore >= roles[i].filter) {
				await dUtil.addRoleToUser(message.author, message.guild, this.getRoleInst(message, roles[i].role)).catch(console.error);
			}
		}
	}

	getRoleInst(message: Message, roleName: string): Role | void {
		if(!(message && message.guild)) return;		
		return message.guild.roles.cache.find((r) => r.name == roleName);
	}
}