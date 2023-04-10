import { BaseInteraction, ChatInputCommandInteraction, Client, EmbedAuthorData, EmbedBuilder, Guild, GuildMember, Role, Snowflake, User } from "discord.js";
import { Manager } from "./Manager";
import { DiscordUtilities } from "../util/DiscordUtilities";
import { ReportManager } from "./ReportManager";
import { UserDates } from "./types/UserDates";

const { relevant_roles, channelsID } = require('../../json/config.json');
const fileName = '../../json/scores.json';
let { scores } = require(fileName);
import util = require('../util/Utilities');

export class StatsManager extends Manager {
	private reportmngr: ReportManager;
	constructor(client: Client, dUtil: DiscordUtilities, reportmngr: ReportManager) {
		super(client, dUtil);
		this.reportmngr = reportmngr;
	}

	override async doProcess(interaction: BaseInteraction): Promise<void> {
		if (interaction instanceof ChatInputCommandInteraction) {
			interaction.deferReply().catch(console.error);

			const { user, guild } = interaction;
			const argUser = interaction.options.getUser('user');
			const target: User = (argUser ? argUser : user);
			const isServiceProvider = await this.dUtil.isServiceProvider(guild, target.id);

			const guildmember = await this.dUtil.getGuildMemberFromID(target.id, guild).catch(console.error);
			if(!guildmember) return;

			let reports = this.reportmngr.getVerifiedReportsMatrix(target.id.toString());
			if (reports == "") reports = "CLEAN RECORD";

			const authorDetails: EmbedAuthorData = {
				name: `${target.username}#${target.discriminator}`,
				iconURL: `${target.displayAvatarURL()}`
			}

			const roles = this.rolesToString(guildmember);
			const userDates: UserDates = this.getUserDates(guildmember);

			let feedbackCount = (isServiceProvider? await this.countFeedbackForUser(guild, target.id): "0");

			interaction.reply({
				embeds: [
					await this.generateStats(guildmember, roles, authorDetails, reports, userDates, isServiceProvider, feedbackCount.toString())]
			}).catch(console.error);
		}
	}

	generateStats(gm: GuildMember, roles: string, authorDetails: EmbedAuthorData, reports: string, userDates: UserDates, isServiceProvider: Boolean, feedbackCount: string): EmbedBuilder {
		let record = scores[gm.user.id];
		let transStr = "";

		if (record == null) {
			record = {}
			record["points"] = "ZERO";
			transStr = "NO TRANSACTIONS YET!";
		}
		else {
			let sortedTrans = [];
			for (let t in record.transactions) {
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

	getScore(id: Snowflake) {
		if (scores[id] == null) return 0;
		else return scores[id].points;
	}

	generateScoreCard(authorDetails: EmbedAuthorData, points: string, roles: string, transStr: string, reports: string, userDates: UserDates, isServiceProvider: Boolean, feedbackCount: string) {
		let embedBuilder = new EmbedBuilder()
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
		let feedback = await this.dUtil.fetchAllMessagesMentionsUser(guild, userID, channelsID.serviceFeedback);
		if(feedback)
			return feedback.length.toString();
		return "0";
	}

	getUserDates(gm: GuildMember): UserDates {
		let userDates: UserDates = {
			creaStr: gm.user.createdAt.toString(),
			creaDur: util.getTimeDiff(gm.user.createdAt).join(' '),
			joinStr: (gm.joinedAt? gm.joinedAt.toString(): "NOT IN THE SERVER"),
			joinDur: (gm.joinedAt? util.getTimeDiff(gm.joinedAt).join(' '): "NOT IN THE SERVER"),
		};
		return userDates;
	}
}