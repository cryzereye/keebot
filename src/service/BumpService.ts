const { EmbedBuilder } = require('discord.js');
import { Client, Guild, Message, Snowflake, User } from "discord.js";
import { Service } from "./Service";
import { Post } from "../models/types/Post";

const PostModel = require('../models/PostModel');
const dUtil = require('../util/DiscordUtil');
const util = require('../util/Utilities');
const { channelsID, dev } = require('../../json/config.json');

export class BumpService extends Service {
	private queue: Array<Post>;

	constructor(client: Client) {
		super(client);
		this.queue = [];
		this.startService();
	}

	override async startService() {
		console.log(`[${new Date().toLocaleString()}] Bump service started...`);
		// loop for check intervals
		while (true) {
			this.queue = PostModel.getAllNeedsBump();

			// loop for queue content
			while (true) {
				const currDate: Date = new Date();

				let currPost: Post | undefined = this.queue.shift();

				if (!currPost) break;
				console.log(`[${new Date().toLocaleString()}] Processing bump/expiry ${currPost.have}/${currPost.want}`);

				// preps to get the original post message from channel
				let channel = PostModel.getChannelFromType(currPost.type);
				let origPost = await dUtil.getMessageFromID(
					await dUtil.getGuildFromID(this.client, channelsID.server),
					channel,
					currPost.postID
				).catch(console.error);

				// if the original post message as fetched
				if (origPost) {
					let url = PostModel.generateUrl(channel, currPost.postID);

					if (await this.checkExpiry(currPost, origPost, currDate)) break;

					// the actual bump process
					let message = await origPost.reply({
						content: `Bumping this post\n\n${url}`,
						embeds: [this.getEmbed(origPost.mentions.users.at(0), currPost)]
					}).catch(console.error);

					// updates to the post records or retries fails
					if (message) {
						let newBumpDate = util.addHours(Date.now(), 8 + (Math.random() * 4)); // randoms 8-12 hours
						if (dev)
							newBumpDate = util.addHours(Date.now(), Math.floor(Math.random() * 4)); // randoms 0-4 minutes
							
						PostModel.bumped(currPost.postID, newBumpDate);
						this.notifyLastBumpBeforeExpiry(newBumpDate, currPost.expiryDate, currPost.authorID, url);

						continue;
					}
					else this.queue.push(currPost) //retry
				}
				else this.queue.push(currPost) // retry
			}

			await this.sleep();
		}
	}

	getEmbed(user: User, post: Post) {
		const authorName = user.username + '#' + user.discriminator;
		const avatarURL = user.displayAvatarURL();

		const embedBuilder = new EmbedBuilder()
			.setColor("Default")
			.setAuthor({
				name: authorName,
				iconUrl: `${avatarURL}`
			})
			.setDescription(`HAVE: ${post.have}\n\nWANT: ${post.want}`)
			.setThumbnail(`${avatarURL}`);

		return embedBuilder;
	}

	/**
	 * marks all posts and related items as spoilers
	 * @param {Discord.js.TextMessage} origPost 
	 * @param {Snowflake} currPost 
	 * @returns {Boolean} true
	 */
	async spoilExpiredPost(origPost: Message, currPost: Post) {
		await origPost.edit(`||${origPost.content}||`).catch(console.error);

		let ch = channelsID.newListings;

		currPost.newListID.map(async (x) => {
			let guild: Guild | null = origPost.guild;
			let guildId: Snowflake | undefined= guild?.id;
			await dUtil.makeMessageSpoiler(origPost.client, guildId, ch, x);
		});
		return true;
	}

	async checkExpiry(currPost: Post, origPost: Message, currDate: Date) {
		if (new Date(currPost.expiryDate) < currDate) {
			if (await this.spoilExpiredPost(origPost, currPost)) {
				console.log(`${currPost.have}/${currPost.want} expired`);
				PostModel.expired(currPost.postID);
				return true;
			}
		}
		return false;
	}

	async notifyLastBumpBeforeExpiry(newBumpDate: string, expiryDate: string, authorID: Snowflake, url: string) {
		if (new Date(newBumpDate) < new Date(expiryDate)) return;

		let user = await dUtil.getUserFromID(this.client, authorID);
		if (!user) {
			console.log(`Cannot find user ${authorID}`);
			return;
		}

		for (let tries = 0; tries < 5; tries++) {
			let expiryDM = await user.send(`${url}\n\nLast bump done for the post above. This will be automatically marked as expired on ${expiryDate}`);
			if (expiryDM) break;
		}
	}

	async sleep() {
		if (dev)
			await new Promise(resolve => setTimeout(resolve, util.getMinutes(1)));
		else
			await new Promise(resolve => setTimeout(resolve, util.getMinutes(5)));
	}
}