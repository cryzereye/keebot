import { BaseInteraction, ChatInputCommandInteraction, EmbedAuthorData, EmbedBuilder, Guild, GuildMember, Role, Snowflake, User } from "discord.js";
import * as Manager from "./Manager.js";
import * as UserDates from "./types/UserDates.js";

import { channelsID, relevant_roles } from '../../json/config.json';

export class StatsManager extends Manager.Manager {
	constructor() {
		super();
	}

	async doProcess(interaction: BaseInteraction): Promise<void> {
		if (interaction instanceof ChatInputCommandInteraction) {
			await interaction.reply({
				content: "Processing...",
				ephemeral: true
			}).catch(console.error);

			const { user, guild } = interaction;
			const argUser = interaction.options.getUser('user');
			const target: User = (argUser ? argUser : user);
			const isServiceProvider = await this.dUtil.isServiceProvider(guild, target.id);

			const guildmember = await this.dUtil.getGuildMemberFromID(target.id, guild).catch(console.error);
			if (!guildmember) return;

			let reports = globalThis.REPORTMNGR.getVerifiedReportsMatrix(target.id.toString());
			if (reports == "") reports = "CLEAN RECORD";

			const authorDetails: EmbedAuthorData = {
				name: `${target.username}#${target.discriminator}`,
				iconURL: `${target.displayAvatarURL()}`
			}

			const roles = this.rolesToString(guildmember);
			const userDates: UserDates.UserDates = this.getUserDates(guildmember);

			const feedbackCount = (isServiceProvider ? await this.countFeedbackForUser(guild, target.id) : "0");

			await interaction.editReply({
				content: "",
				embeds: [
					this.generateStats(guildmember, roles, authorDetails, reports, userDates, isServiceProvider, feedbackCount.toString())]
			}).catch(console.error);
		}
	}

	generateStats(gm: GuildMember, roles: string, authorDetails: EmbedAuthorData, reports: string, userDates: UserDates.UserDates, isServiceProvider: boolean, feedbackCount: string): EmbedBuilder {
		let record;
		//= scores[gm.user.id];
		let transStr = "";

		if (record == null) {
			record = {}
			record["points"] = "ZERO";
			transStr = "NO TRANSACTIONS YET!";
		}
		else {
			const sortedTrans = [];
			for (const t in record.transactions) {
				sortedTrans.push([t, record.transactions[t]]);
			}

			sortedTrans.sort(function (a, b) {
				return b[1] - a[1];
			});

			for (let i = 0; i < sortedTrans.length && i < 10; i++)
				transStr += `${sortedTrans[i][0]} : ${sortedTrans[i][1]}\n`;
		}

		return this.generateScoreCard(
			authorDetails,
			record.points,
			roles,
			transStr,
			reports,
			userDates,
			isServiceProvider,
			feedbackCount
		);
	}

	generateScoreCard(authorDetails: EmbedAuthorData, points: string, roles: string, transStr: string, reports: string, userDates: UserDates.UserDates, isServiceProvider: boolean, feedbackCount: string) {
		const embedBuilder = new EmbedBuilder()
			.setColor("DarkAqua")
			.setTitle(`${points} Points`)
			.setAuthor(authorDetails)
			.setDescription(roles)
			.setThumbnail(`${authorDetails.iconURL}`)
			.addFields({ name: 'Transactions (max 10):', value: transStr });

		if (isServiceProvider)
			embedBuilder.addFields({ name: 'Service Feedback Count:', value: feedbackCount });

		embedBuilder.addFields({ name: 'Verified Reports Involved:', value: reports })
			.addFields({ name: 'Account creation date:', value: `${userDates.creaStr}\n${userDates.creaDur} from now` })
			.addFields({ name: 'Server join date:', value: `${userDates.joinStr}\n${userDates.joinDur} from now` });

		return embedBuilder;
	}

	rolesToString(gm: GuildMember): string {
		let roles = "";
		gm.roles.cache.map((r: Role) => {
			if (relevant_roles.includes(r.name))
				roles += `<@&${r.id}> `;
		});
		if (roles == "") roles = "**NO ROLES**";
		return roles;
	}

	async countFeedbackForUser(guild: Guild, userID: Snowflake): Promise<string> {
		const feedback = await this.dUtil.fetchAllMessagesMentionsUser(guild, userID, channelsID.serviceFeedback);
		if (feedback)
			return feedback.length.toString();
		return "0";
	}

	getUserDates(gm: GuildMember): UserDates.UserDates {
		const userDates: UserDates.UserDates = {
			creaStr: gm.user.createdAt.toString(),
			creaDur: globalThis.UTIL.getTimeDiff(gm.user.createdAt).join(' '),
			joinStr: (gm.joinedAt ? gm.joinedAt.toString() : "NOT IN THE SERVER"),
			joinDur: (gm.joinedAt ? globalThis.UTIL.getTimeDiff(gm.joinedAt).join(' ') : "NOT IN THE SERVER"),
		};
		return userDates;
	}
}