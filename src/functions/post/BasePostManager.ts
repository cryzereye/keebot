import { Guild, ModalBuilder, Snowflake } from "discord.js";
import { Post } from "../../models/Post.js";
import { TransactionType } from "../../models/enums/TransactionType.js";
import { PostResult } from "../../processor/types/PostResult.js";
import { PostRepository } from "../../repository/PostRepository.js";
import { ProcessResult } from "../types/ProcessResult.js";

export class BasePostManager {
	repo: PostRepository;
	constructor(repo: PostRepository) {
		this.repo = repo;
	}

	async getValidPostRecord(msgID: Snowflake, channelID: Snowflake, guild: Guild): Promise<Post | undefined> {
		if (channelID == CONFIG.data.channelsID.newListings)
			return this.repo.getPostFromNewListID(msgID);
		else {
			let record = this.repo.find(msgID);
			if (record) return record;
			else {
				const origID: Snowflake | void = await DUTIL.getIdOfRepliedMsg(guild, channelID, msgID);
				if (origID) record = this.repo.find(origID);
				if (record) return record;
			}
		}

		return undefined;
	}

	async isValidPostEditor(userID: Snowflake, authorID: Snowflake, guild: Guild) {
		const isMod = await DUTIL.isMod(guild, userID);
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
			result.content = `Invalid! Make sure you are editing your own post. Pinging <@!${CONFIG.data.me_id}>`;
			return result;
		}

		if (postRecord.isSold) {
			result.content = `Invalid! Post is already marked as sold`;
			return result;
		}

		if (postRecord.isDeleted) {
			result.content = `Invalid! Post is already deleted`;
			return result;
		}
	}

	haveWantValidation(type: TransactionType, have: string, want: string): null | ProcessResult {
		switch (type) {
			case TransactionType.sell: {
				if (!UTIL.isValidAmount(want)) return this.invalidWantError();
				break;
			}
			case TransactionType.buy: {
				if (!UTIL.isValidAmount(have)) return this.invalidHaveError();
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
			content: `Error in post modal generation. Pinging <@!${CONFIG.data.me_id}>`,
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