import { EmbedAuthorData, EmbedBuilder, Guild, Message, Snowflake, User } from 'discord.js';
import { PostType } from "../models/types/PostType.js";
import * as DiscordUtilities from "../util/DiscordUtilities.js";
import * as Service from "./Service.js";

import { channelsID, dev } from '../../json/config.json';
import * as PostModel from '../repository/PostRepository.js';
import * as util from '../util/Utilities.js';

export class BumpService extends Service.Service {
	private queue: Array<PostType>;
	private dUtil: DiscordUtilities.DiscordUtilities;

	constructor() {
		super();
		this.queue = [];
		this.dUtil = globalThis.DUTIL;
	}

	override async startService() {
		console.log(`[${new Date().toLocaleString()}] Bump service started...`);
		const guild = await this.dUtil.getGuildFromID(channelsID.server);
		if (!guild) return;

		// loop for check intervals
		while (true) {
			this.queue = PostModel.getAllNeedsBump();

			// loop for queue content
			while (true) {
				const currDate: Date = new Date();

				const currPost: PostType | undefined = this.queue.shift();

				if (!currPost) break;
				console.log(`[${new Date().toLocaleString()}] Processing bump/expiry ${currPost.have}/${currPost.want}`);

				// preps to get the original post message from channel
				const channel = PostModel.getChannelFromType(currPost.type);
				const origPost = await this.dUtil.getMessageFromID(
					guild,
					channel,
					currPost.postID
				).catch(console.error);

				// if the original post message as fetched
				if (origPost) {
					const url = PostModel.generateUrl(channel, currPost.postID);

					if (await this.checkExpiry(currPost, origPost, currDate, guild)) break;
					const mentioned = origPost.mentions.users.at(0);
					if (!mentioned) {
						this.queue.push(currPost);
						continue;
					}

					// the actual bump process
					const message = await origPost.reply({
						content: `Bumping this post\n\n${url}`,
						embeds: [this.getEmbed(mentioned, currPost)]
					}).catch(console.error);

					// updates to the post records or retries fails
					if (message) {
						let newBumpDate = util.addHours(Date.now().toString(), 8 + (Math.random() * 4)); // randoms 8-12 hours
						if (dev)
							newBumpDate = util.addHours(Date.now().toString(), Math.floor(Math.random() * 4)); // randoms 0-4 minutes

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

	getEmbed(user: User, post: PostType) {
		const authorName = user.username + '#' + user.discriminator;
		const avatarURL = user.displayAvatarURL();
		const authorDetails: EmbedAuthorData = {
			name: authorName,
			iconURL: avatarURL
		}

		const embedBuilder = new EmbedBuilder()
			.setColor("Default")
			.setAuthor(authorDetails)
			.setDescription(`HAVE: ${post.have}\n\nWANT: ${post.want}`)
			.setThumbnail(`${avatarURL}`);

		return embedBuilder;
	}

	/**
	 * marks all posts and related items as spoilers
	 * @param {Discord.js.TextMessage} origPost 
	 * @param {Snowflake} currPost 
	 * @returns {boolean} true
	 */
	async spoilExpiredPost(origPost: Message, currPost: PostType, guild: Guild) {
		await origPost.edit(`||${origPost.content}||`).catch(console.error);

		const ch = channelsID.newListings;

		currPost.newListID.map(async (x) => {
			const guildId: Snowflake = guild.id;
			await this.dUtil.makeMessageSpoiler(guildId, ch, x);
		});
		return true;
	}

	async checkExpiry(currPost: PostType, origPost: Message, currDate: Date, guild: Guild) {
		if (new Date(currPost.expiryDate) < currDate) {
			if (await this.spoilExpiredPost(origPost, currPost, guild)) {
				console.log(`[${new Date().toLocaleString()}] ${currPost.have}/${currPost.want} expired`);
				PostModel.expired(currPost.postID);
				return true;
			}
		}
		return false;
	}

	async notifyLastBumpBeforeExpiry(newBumpDate: string, expiryDate: string, authorID: Snowflake, url: string) {
		if (new Date(newBumpDate) < new Date(expiryDate)) return;

		const user = await this.dUtil.getUserFromID(authorID);
		if (!user) {
			console.log(`Cannot find user ${authorID}`);
			return;
		}

		for (let tries = 0; tries < 5; tries++) {
			const expiryDM = await user.send(`${url}\n\nLast bump done for the post above. This will be automatically marked as expired on ${expiryDate}`);
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