import { BaseInteraction, ChatInputCommandInteraction, EmbedAuthorData, EmbedBuilder, Guild, GuildMember, Role, Snowflake, User } from "discord.js";
import { Manager } from "./Manager.js";
import { UserDates } from "./types/UserDates.js";

export class StatsManager extends Manager {
	constructor() {
		super();
	}

	async doProcess(interaction: BaseInteraction): Promise<void> {
		if (interaction instanceof ChatInputCommandInteraction) {
			await interaction.followUp({
				content: "Processing stats...",
				ephemeral: true
			}).catch(console.error);

			const { user, guild } = interaction;
			const argUser = interaction.options.getUser('user');
			const target: User = (argUser ? argUser : user);
			const isServiceProvider = await DUTIL.isServiceProvider(guild, target.id);

			const guildmember = await DUTIL.getGuildMemberFromID(target.id, guild).catch(console.error);
			if (!guildmember) return;

			let reports = REPORTMNGR.getVerifiedReportsMatrix(target.id.toString());
			if (reports == "") reports = "CLEAN RECORD";

			const authorDetails: EmbedAuthorData = {
				name: `${target.username}#${target.discriminator}`,
				iconURL: `${target.displayAvatarURL()}`
			}

			const roles = this.rolesToString(guildmember);
			const userDates: UserDates = this.getUserDates(guildmember);

			const feedbackCount = (isServiceProvider ? await this.countFeedbackForUser(guild, target.id) : "0");

			await interaction.editReply({
				content: "",
				embeds: [
					this.generateStats(guildmember, roles, authorDetails, reports, userDates, isServiceProvider, feedbackCount.toString())]
			}).catch(console.error);
		}
	}

	generateStats(gm: GuildMember, roles: string, authorDetails: EmbedAuthorData, reports: string, userDates: UserDates, isServiceProvider: boolean, feedbackCount: string): EmbedBuilder {
		const record = SCOREMNGR.repo.find(gm.id)
		let transStr = "";

		if (record == undefined) {
			transStr = "NO TRANSACTIONS YET!";
		}
		else {
			const trans = record.transactions;

			trans.sort(function (a, b) {
				return b.count - a.count;
			});

			for (let i = 0; i < trans.length && i < 10; i++)
				transStr += `${trans[i].userName} : ${trans[i].count}\n`;
		}

		return this.generateScoreCard(
			authorDetails,
			(record ? record.points.toString() : "ZERO"),
			roles,
			transStr,
			reports,
			userDates,
			isServiceProvider,
			feedbackCount
		);
	}

	generateScoreCard(authorDetails: EmbedAuthorData, points: string, roles: string, transStr: string, reports: string, userDates: UserDates, isServiceProvider: boolean, feedbackCount: string) {
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
			if (CONFIG.data.relevant_roles.includes(r.name))
				roles += `<@&${r.id}> `;
		});
		if (roles == "") roles = "**NO ROLES**";
		return roles;
	}

	async countFeedbackForUser(guild: Guild, userID: Snowflake): Promise<string> {
		const feedback = await DUTIL.fetchAllMessagesMentionsUser(guild, userID, CONFIG.data.channelsID.serviceFeedback);
		if (feedback)
			return feedback.length.toString();
		return "0";
	}

	getUserDates(gm: GuildMember): UserDates {
		const userDates: UserDates = {
			creaStr: gm.user.createdAt.toString(),
			creaDur: UTIL.getTimeDiff(gm.user.createdAt).join(' '),
			joinStr: (gm.joinedAt ? gm.joinedAt.toString() : "NOT IN THE SERVER"),
			joinDur: (gm.joinedAt ? UTIL.getTimeDiff(gm.joinedAt).join(' ') : "NOT IN THE SERVER"),
		};
		return userDates;
	}
}