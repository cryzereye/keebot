import { EmbedAuthorData, EmbedBuilder, Guild, Message, Snowflake, User } from 'discord.js';
import { Post } from '../models/Post.js';
import { Service } from "./Service.js";

import { channelsID, dev } from '../../json/config.json';

export class BumpService extends Service {
	private queue: Array<Post>;

	constructor() {
		super();
		this.queue = [];
	}

	async startService() {
		console.log(`[${new Date().toLocaleString()}] Bump service started...`);
		const guild = await DUTIL.getGuildFromID(channelsID.server);
		if (!guild) return;

		// loop for check intervals
		while (true) {
			this.queue = POSTFACTORY.repo.getAllNeedsBump();

			// loop for queue content
			while (true) {
				const currDate: Date = new Date();
				const currPost: Post | undefined = this.queue.shift();

				if (!currPost) break;
				console.log(`[${new Date().toLocaleString()}] Processing bump/expiry ${currPost.have}/${currPost.want}`);

				// preps to get the original post message from channel
				const channel = Post.getChannelFromType(currPost.type);
				const origPost = await DUTIL.getMessageFromID(
					guild,
					channel,
					currPost.postID
				).catch(console.error);

				// if the original post message as fetched
				if (origPost) {
					if (await this.checkExpiry(currPost, origPost, currDate, guild)) break;
					const mentioned = origPost.mentions.users.at(0);
					if (!mentioned) {
						this.queue.push(currPost);
						continue;
					}

					// the actual bump process
					const message = await origPost.reply({
						content: `Bumping this post\n\n${currPost.URL}`,
						embeds: [this.getEmbed(mentioned, currPost)]
					}).catch(console.error);

					// updates to the post records or retries fails
					if (message) {
						currPost.bumped();
						this.notifyLastBumpBeforeExpiry(currPost.bumpDate, currPost.expiryDate, currPost.authorID, currPost.URL);

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
	async spoilExpiredPost(origPost: Message, currPost: Post, guild: Guild) {
		await origPost.edit(`||${origPost.content}||`).catch(console.error);

		const ch = channelsID.newListings;

		currPost.newListID.map(async (x) => {
			const guildId: Snowflake = guild.id;
			await DUTIL.makeMessageSpoiler(guildId, ch, x);
		});
		return true;
	}

	async checkExpiry(currPost: Post, origPost: Message, currDate: Date, guild: Guild) {
		if (currPost.expiryDate < currDate) {
			if (await this.spoilExpiredPost(origPost, currPost, guild)) {
				console.log(`[${new Date().toLocaleString()}] ${currPost.have}/${currPost.want} expired`);
				currPost.expire();
				return true;
			}
		}
		return false;
	}

	async notifyLastBumpBeforeExpiry(newBumpDate: Date, expiryDate: Date, authorID: Snowflake, url: string) {
		if (newBumpDate < expiryDate) return;

		const user = await DUTIL.getUserFromID(authorID);
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
			await new Promise(resolve => setTimeout(resolve, UTIL.getMinutes(1)));
		else
			await new Promise(resolve => setTimeout(resolve, UTIL.getMinutes(5)));
	}
}