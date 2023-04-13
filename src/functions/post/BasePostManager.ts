import { Client, Guild, ModalBuilder, Snowflake } from "discord.js";
import { TransactionType } from "../../models/enums/TransactionType.js";
import { Post } from "../../models/types/Post.js";
import { PostResult } from "../../processor/types/PostResult.js";
import { DiscordUtilities } from "../../util/DiscordUtilities.js";
import { ProcessResult } from "../types/ProcessResult.js";

import * as PostModel from '../../models/PostModel.js';
import * as util from '../../util/Utilities.js';

import { channelsID, me_id } from '../../../json/config.json';


export abstract class BasePostManager {
	protected client: Client;
	protected dUtil: DiscordUtilities;


	constructor() {
		this.client = globalThis.CLIENT;
		this.dUtil = globalThis.DUTIL;
	}

	async getValidPostRecord(msgID: Snowflake, channelID: Snowflake, guild: Guild): Promise<Post | null> {
		if (channelID == channelsID.newListings)
			return PostModel.getPostFromNewListID(msgID);
		else {
			let record = PostModel.get(msgID);
			if (record) return record;
			else {
				const origID: Snowflake | void = await this.dUtil.getIdOfRepliedMsg(guild, channelID, msgID);
				if (origID) record = PostModel.get(origID);
				if (record) return record;
			}
		}

		return null;
	}

	async isValidPostEditor(userID: Snowflake, authorID: Snowflake, guild: Guild) {
		const isMod = await this.dUtil.isMod(guild, userID);
		return (authorID == userID || isMod);
	}

	async postUpdatePreValidations(postRecord: Post, userID: Snowflake, authorID: Snowflake, guild: Guild): Promise<PostResult | void> {
		const validEditor = await this.isValidPostEditor(userID, authorID, guild);
		const result: PostResult = {
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

	haveWantValidation(type: TransactionType, have: string, want: string): null | ProcessResult {
		switch (type) {
			case TransactionType.sell: {
				if (!util.isValidAmount(want)) return this.invalidWantError();
				break;
			}
			case TransactionType.buy: {
				if (!util.isValidAmount(have)) return this.invalidHaveError();
				break;
			}
		}

		return null;
	}

	invalidWantError(): ProcessResult {
		const result: ProcessResult = {
			processed: false,
			url: "",
			newListingURL: "",
			errorContent: "WANT should be a valid amount"
		};
		return result;
	}

	invalidHaveError(): ProcessResult {
		const result: ProcessResult = {
			processed: false,
			url: "",
			newListingURL: "",
			errorContent: "HAVE should be a valid amount"
		};
		return result;
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