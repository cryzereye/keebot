import { Snowflake } from "discord.js";
import { Notification } from "../models/Notification.js";
import { BaseRepository } from "./BaseRepository.js";

export class NotificationRepository extends BaseRepository {
	cache: Array<Notification>;
	constructor() {
		super(`json/notif.json`);
		this.cache = <Array<Notification>>this.load().post;
	}

	new(notif: Notification): void {
		this.cache.push(notif);
		this.save({ "notif": this.cache });
	}

	deleteKeywords(userID: Snowflake, id: number): void {
		const index = this.findNotifIndex(userID);
		if (index > -1) {
			this.cache[index].deleteKeywords(id);
			this.save({ "notif": this.cache });
		}
	}

	addKeywords(userID: Snowflake, id: number, keywords: string[]): void {
		const index = this.findNotifIndex(userID);

		if (index > -1)
			this.cache[index].editKeywords(id, keywords);
		else
			this.new(new Notification(userID, keywords));

		this.save({ "notif": this.cache });
	}

	find(userID: Snowflake) {
		return this.cache.find(notif => notif.userID === userID);
	}

	editKeywords(userID: Snowflake, id: number, keywords: string[]): void {
		const index = this.findNotifIndex(userID);
		if (index > -1) {
			this.cache[index].editKeywords(id, keywords);
			this.save({ "notif": this.cache });
		}
	}

	findNotifIndex(id: Snowflake): number {
		return this.cache.map((notif: Notification) => notif.userID).indexOf(id);
	}
}