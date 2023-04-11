import { Client, Guild, ModalBuilder, Snowflake } from "discord.js";
import { Post } from "../../models/types/Post";
import { PostResult } from "../../processor/types/PostResult";

import PostModel = require('../../models/PostModel');
import util = require('../../util/Utilities');
import { DiscordUtilities } from "../../util/DiscordUtilities";
import { TransactionType } from "../../models/enums/TransactionType";

const { channelsID, me_id } = require('../../../json/config.json');

export abstract class BasePostManager {
	protected client: Client;
	protected dUtil: DiscordUtilities;
	

	constructor() {
		this.client = globalThis.client;
        this.dUtil = globalThis.dUtil;
	}

	async getValidPostRecord(msgID: Snowflake, channelID: Snowflake, guild: Guild): Promise<Post | null> {
			if (channelID == channelsID.newListings)
				return PostModel.getPostFromNewListID(msgID);
			else {
				let record = PostModel.get(msgID);
				if (record) return record;
				else {
					const origID: Snowflake | void = await this.dUtil.getIdOfRepliedMsg(guild, channelID, msgID);
					if(origID) record = PostModel.get(origID);
					if (record) return record;
				}
			}
	
			return null;
	}

	async isValidPostEditor(userID: Snowflake, authorID: Snowflake, guild: Guild) {
		let isMod = await this.dUtil.isMod(guild, userID);
		return (authorID == userID || isMod);
	}

	async postUpdatePreValidations(postRecord: Post, userID: Snowflake, authorID: Snowflake, guild: Guild): Promise<PostResult | void> {
		let validEditor = await this.isValidPostEditor(userID, authorID, guild);
		let result: PostResult = {
			success: false,
			content: "",
			isModal: false,
			modal: null
		};

		if (!validEditor) {
			result.content = `Invalid! Make sure you are editing your own post. Pinging <@!${me_id}>`;
			return result;
		}

		if (postRecord.sold) {
			result.content = `Invalid! Post is already marked as sold`;
			return result;
		}

		if (postRecord.deleted) {
			result.content = `Invalid! Post is already deleted`;
			return result;
		}
	}

	haveWantValidation(type: TransactionType, have: string, want: string) {
		switch (type) {
			case TransactionType.sell: {
				if (!util.isValidAmount(want)) this.invalidWantError();
				break;
			}
			case TransactionType.buy: {
				if (!util.isValidAmount(have)) this.invalidHaveError();
				break;
			}
		}
	}

	invalidWantError() {
		return {
			posted: false,
			url: "",
			errorContent: "WANT should be a valid amount"
		};
	}

	invalidHaveError() {
		return {
			posted: false,
			url: "",
			errorContent: "HAVE should be a valid amount"
		};
	}

	successModal(modal: ModalBuilder) {
		return {
			success: true,
			content: "",
			isModal: true,
			modal: modal
		}
	}

	failModal() {
		return {
			success: false,
			content: `Error in post modal generation. Pinging <@!${me_id}>`,
			isModal: false,
			modal: null
		}
	}

	invalidPost() {
		return {
			success: false,
			content: `Invalid! Post/ID does not exist.`,
			isModal: false,
			modal: null
		}
	}

	cleanUserEntries(data: any) {
		Object.keys(data).forEach(x => {
			if (!data[x] || x === "details") return;
			data[x] = data[x].toString().replace("\n", " ");
		});
		return data;
	}
}