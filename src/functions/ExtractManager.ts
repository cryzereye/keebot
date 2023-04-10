import { BaseInteraction, ChatInputCommandInteraction, Client, Collection, FetchMessagesOptions, Guild, InteractionReplyOptions, Message, Snowflake, TextChannel } from "discord.js";
import { Manager } from "./Manager";
import { RoleGiverManager } from "./RoleGiverManager";
import { DiscordUtilities } from "../util/DiscordUtilities";
import { ScoreManager } from "./ScoreManager";

const { channelsID } = require('../../json/config.json');

export class ExtractManager extends Manager {
    private scoremngr: ScoreManager
    private rolegivermngr: RoleGiverManager

    constructor(client: Client, dUtil: DiscordUtilities, scoremngr: ScoreManager, rolegivermngr: RoleGiverManager) {
        super(client, dUtil);
        this.scoremngr = scoremngr;
        this.rolegivermngr = rolegivermngr;
    }

    override async doProcess(interaction: BaseInteraction): Promise<void> {
        const { user, guild } = interaction;
        if (!(user && guild && this.dUtil.isAdmin(guild, user.id))) return;

        if (interaction instanceof ChatInputCommandInteraction)
            await interaction.reply(await this.doExtract(guild)).catch(console.error);;
    }

    async doExtract(guild: Guild): Promise<InteractionReplyOptions> {
        const vouchChannel = this.dUtil.getTextChannelFromID(guild, channelsID.verify);
        if (!(vouchChannel instanceof TextChannel)) return {
            content: "Error in extracting vouches. See logs",
            ephemeral: true
        };

        let count = 0;
        let hasMoreMessages = true;
        let lastMessageID: Snowflake | undefined;

        this.scoremngr.clearScores();

        while (hasMoreMessages) {
            // from https://stackoverflow.com/questions/55153125/fetch-more-than-100-messages
            let options: FetchMessagesOptions = { limit: 100 };
            if (lastMessageID) options.before = lastMessageID;

            await vouchChannel.messages.fetch(options).then((msglist: Collection<Snowflake, Message>) => {
                const { countReturn, lastMessageIDReturn} = this.traverseMessageList(msglist, count, lastMessageID, guild);
                count = countReturn;
                lastMessageID = lastMessageIDReturn;
                if (count > 0 && count % 100 != 0) hasMoreMessages = false;
            })
            .catch(console.error);
        }
        console.log(`[${new Date().toLocaleString()}] Message count: ${count}`);

        return {
            content: "Extraction complete",
            ephemeral: true
        };
    }

    traverseMessageList(msgList: Collection<Snowflake, Message> , countReturn: number, lastMessageIDReturn:Snowflake | undefined, guild: Guild): any {
        msgList.forEach(async (msg: Message) => {
            this.processMessage(msg, guild);
            countReturn++;
            lastMessageIDReturn = msg.id;
            await new Promise(resolve => setTimeout(resolve, 50)); // 50 ms delay in between
        });

        return {countReturn, lastMessageIDReturn};
    }

    processMessage(msg: Message, guild: Guild) {
        let owner = msg.author.username + '#' + msg.author.discriminator;
        try {
            let mentions = msg.mentions.users; // mentioned by initial vouch
            mentions.map(x => {
                this.scoremngr.addPoint(msg.author.id.toString(), owner, x.username + '#' + x.discriminator);
                this.rolegivermngr.roleCheck(this.scoremngr.getScore(msg.author.id.toString()), msg.author, guild);
            });
        }
        catch (e) {
            console.log(`[${new Date().toLocaleString()}] Error with extracting data for ${owner}`);
            console.log(e);
        }
    }
}