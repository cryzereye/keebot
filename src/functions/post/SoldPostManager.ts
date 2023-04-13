import { BaseInteraction, Guild, ModalSubmitInteraction, Snowflake } from "discord.js";
import * as ProcessResult from "../types/ProcessResult.js";

import * as SoldPostModal from '../modal/SoldPostModal.js';
import * as BasePostManager from './BasePostManager.js';

import { channelsID } from '../../../json/config.json';
import { PostResult } from "../../processor/types/PostResult.js";
import * as PostModel from '../../repository/PostRepository.js';

export class SoldPostManager extends BasePostManager.BasePostManager {
    constructor() {
        super();
    }

    async doModal(interaction: BaseInteraction, argPostID: Snowflake): Promise<PostResult> {
        const { guild, user, channelId } = interaction;
        if (!(guild && user && channelId)) return this.invalidPost();
        const post = await this.getValidPostRecord(argPostID, channelId, guild);

        if (post) {
            const errors = await this.postUpdatePreValidations(post, user.id, post.authorID, guild);
            if (errors) return errors;

            const modal = new SoldPostModal.SoldPostModal(post.type, post.postID, post.have, post.want);
            if (modal) return this.successModal(modal);
            else return this.failModal();
        }
        else return this.invalidPost();
    }

    async doProcess(guild: Guild, data: any): Promise<ProcessResult.ProcessResult> {
        const record = PostModel.get(data.postID);
        const newListingsCh = channelsID.newListings;

        if (record) {
            const channelID = PostModel.getChannelFromType(record.type);
            const postMsg = await this.dUtil.getMessageFromID(guild, channelID, data.postID).catch(console.error);

            if (!postMsg) {
                return {
                    processed: false,
                    url: "",
                    newListingURL: "",
                    errorContent: "Unable to fetch message from channel."
                };
            }

            const newContent = `||${postMsg.content}||`;

            const message = await postMsg.edit(newContent).catch(console.error);
            if (!message) {
                return {
                    processed: false,
                    url: "",
                    newListingURL: "",
                    errorContent: "Unable to mark post as sold"
                };
            }
            const msgURL = PostModel.generateUrl(message.channel.id, message.id);

            PostModel.markSold(
                data.postID,
                data.soldDate
            );

            record.newListID.map(async (x: Snowflake) => {
                await this.dUtil.makeMessageSpoiler(guild.id, newListingsCh, x);
            });

            return {
                processed: true,
                url: msgURL,
                newListingURL: "",
                errorContent: ""
            };
        }
        else {
            return {
                processed: false,
                url: "",
                newListingURL: "",
                errorContent: "Invalid! Post/ID does not exist."
            };
        }
    }

    async doModalDataProcess(interaction: ModalSubmitInteraction) {
        const { guild } = interaction;
        if (!guild) return;

        const fields = interaction.fields.fields;
        const postID = fields.keys().next().value;
        let data = {
            postID: (postID && postID != "have" ? postID : undefined),
            deleteDate: new Date(interaction.createdAt).toString()
        };
        let soldResult;

        data = this.cleanUserEntries(data);

        const result: ProcessResult.ProcessResult | void = await this.doProcess(
            guild, data
        ).catch(console.error);

        if (!result) return;
        const { processed, url, errorContent } = result;

        if (processed)
            soldResult = `Your post has been marked sold:\n${url}`;
        else
            soldResult = errorContent;

        this.dUtil.postProcess(interaction, processed, soldResult, false, null);
    }
}