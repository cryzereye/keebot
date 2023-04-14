import { Guild, Role, User } from "discord.js";
import { Manager } from "./Manager.js";

export class RoleGiverManager extends Manager {
	constructor() {
		super();
	}

	async roleCheck(userScore: number, author: User, guild: Guild) {
		const len = CONFIG.data.roles.length;
		for (let i = 0; i < len; i++) {
			if (userScore >= CONFIG.data.roles[i].filter) {
				await DUTIL.addRoleToUser(author, guild, this.getRoleInst(guild, CONFIG.data.roles[i].role)).catch(console.error);
			}
		}
	}

	getRoleInst(guild: Guild, roleName: string): Role | void {
		if (!guild) return;
		return guild.roles.cache.find((r) => r.name == roleName);
	}
}