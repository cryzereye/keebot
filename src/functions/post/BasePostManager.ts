const { relevant_roles, me_id, dev } = require('../../../json/config.json');
const Post = require('../../models/Post');
const dUtil = require('../../util/DiscordUtil');
const util = require('../../util/Utilities');

class BasePostManager {
	constructor(client) {
		this.client = client;
	}

	doModal() {
		return {
			success: false,
			content: "**FATAL ERROR. CONTACT MODS**",
			isModal: false,
			modal: null
		}
	}

	doProcess() {
		return {
			success: false,
			content: "**FATAL ERROR. CONTACT MODS**",
			isModal: false,
			modal: null
		}
	}

	doModalDataProcess() {
		return {
			success: false,
			content: "**FATAL ERROR. CONTACT MODS**",
			isModal: false,
			modal: null
		}
	}

	async getValidPostRecord(msgID, channelID, guild) {
		if (channelID == channelsID.newListings)
			return Post.getPostFromNewListID(msgID);
		else {
			let record = Post.get(msgID);
			if (record) return record;
			else {
				const origID = await dUtil.getIdOfRepliedMsg(guild, channelID, msgID);
				record = Post.get(origID);
				if (record) return record;
			}
		}

		return null;
	}

	async isValidPostEditor(userID, authorID, guild) {
		let isMod = await dUtil.isMod(guild, userID);
		return (authorID == userID || isMod);
	}

	async postUpdatePreValidations(postRecord, userID, authorID, guild) {
		let validEditor = await this.isValidPostEditor(userID, authorID, guild);
		if (!validEditor) {
			return {
				success: false,
				content: `Invalid! Make sure you are editing your own post. Pinging <@!${me_id}>`,
				isModal: false,
				modal: null
			}
		}

		if (postRecord.sold) {
			return {
				success: false,
				content: `Invalid! Post is already marked as sold`,
				isModal: false,
				modal: null
			}
		}

		if (postRecord.deleted) {
			return {
				success: false,
				content: `Invalid! Post is already deleted`,
				isModal: false,
				modal: null
			}
		}
	}

	haveWantValidation(type, have, want) {
		switch (type) {
			case "sell": {
				if (!util.isValidAmount(want)) this.invalidWantError();
				break;
			}
			case "buy": {
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

	successModal(modal) {
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

	cleanUserEntries(data) {
		Object.keys(data).forEach(x => {
			if (x === "details") return;
			data[x] = data[x].toString().replace("\n", " ");
		});
		return data;
	}
}

module.exports = { BasePostManager }