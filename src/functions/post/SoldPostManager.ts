import { BaseInteraction, Client, Guild, ModalSubmitInteraction, Snowflake } from "discord.js";
import { DiscordUtilities } from "../../util/DiscordUtilities";
import { ProcessResult } from "../types/ProcessResult";

const { BasePostManager } = require('./BasePostManager');
const { SoldPostModal } = require('../modal/SoldPostModal');

const { PostModel } = require('../../models/PostModel');
const { channelsID } = require('../json/config.json');

export class SoldPostManager extends BasePostManager {
    constructor(client: Client, dUtil: DiscordUtilities) {
        super(client, dUtil);
    }

    async doModal(interaction: BaseInteraction, argPostID: Snowflake) {
        let { guild, user, channelId } = interaction;
        let post = await this.getValidPostRecord(argPostID, channelId, guild);

        if (post) {
            const errors = this.postUpdatePreValidations(post, user.id, post.authorID, guild);
            if (errors) return errors;

            let modal = new SoldPostModal(post.type, post.postID, post.have, post.want);
            if (modal) return this.successModal(modal);
            else return this.failModal();
        }
        else return this.invalidPost();
    }

    async doProcess(guild: Guild, data: any): Promise <ProcessResult> {
        let record = PostModel.get(data.postID);
        const newListingsCh = channelsID.newListings;

        if (record) {
            const channelID = PostModel.getChannelFromType(record.type);
            const postMsg = await this.dUtil.getMessageFromID(guild, channelID, data.postID).catch(console.error);

            if (!postMsg) {
                return {
                    processed: false,
                    url: "",
                    errorContent: "Unable to fetch message from channel."
                };
            }

            let newContent = `||${postMsg.content}||`;

            const message = await postMsg.edit(newContent).catch(console.error);
            if (!message) {
                return {
                    processed: false,
                    url: "",
                    errorContent: "Unable to mark post as sold"
                };
            }
            let msgURL = PostModel.generateUrl(message.channel.id, message.id);

            PostModel.markSold(
                data.postID,
                data.soldDate
            );

            record.newListID.map(async (x: Snowflake) => {
                await this.dUtil.makeMessageSpoiler(guild.client, guild.id, newListingsCh, x);
            });

            return {
                processed: true,
                url: msgURL,
                errorContent: ""
            };
        }
        else {
            return {
                processed: false,
                url: "",
                errorContent: "Invalid! Post/ID does not exist."
            };
        }
    }

    async doModalDataProcess(interaction: ModalSubmitInteraction) {
        const { guild } = interaction;
        if(!guild) return;

        const fields = interaction.fields.fields;
        const postID = fields.keys().next().value;
        let data = {
            postID: (postID && postID != "have" ? postID : undefined),
            deleteDate: new Date(interaction.createdAt).toString()
        };
        let soldResult;

        data = this.cleanUserEntries(data);

        const result: ProcessResult | void = await this.doProcess(
            guild, data
        ).catch(console.error);

        if(!result) return;
        const { processed, url, errorContent } = result;

        if (processed)
            soldResult = `Your post has been marked sold:\n${url}`;
        else
            soldResult = errorContent;

        this.dUtil.postProcess(interaction, processed, soldResult, false, null);
    }
}