import { BaseInteraction, Guild, ModalSubmitInteraction, Snowflake } from "discord.js";
import { PostResult } from "../../processor/types/PostResult.js";

import { channelsID } from '../../../json/config.json';
import { DeletePostModal } from '../modal/DeletePostModal.js';
import { ProcessResult } from "../types/ProcessResult.js";
import { BasePostManager } from './BasePostManager.js';

import * as PostModel from '../../repository/PostRepository.js';
import { PostRepository } from "../../repository/PostRepository.js";

export class DeletePostManager extends BasePostManager {
    constructor(repo: PostRepository) {
        super(repo);
    }

    async doModal(interaction: BaseInteraction, argPostID: Snowflake): Promise<PostResult> {
        const { guild, user, channelId } = interaction;
        if (!(guild && user && channelId)) return this.invalidPost();
        const post = await this.getValidPostRecord(argPostID, channelId, guild);

        if (post) {
            const errors = await this.postUpdatePreValidations(post, user.id, post.authorID, guild);
            if (errors) return errors;

            const modal = new DeletePostModal(post.type, post.postID, post.have, post.want);
            if (modal) return this.successModal(modal);
            else return this.failModal();
        }
        else return this.invalidPost();
    }

    async doProcess(guild: Guild, data: any): Promise<ProcessResult> {
        const newListingsCh = channelsID.newListings;
        const record = PostModel.get(data.postID);

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

            const deletedPostMsg = await this.dUtil.sendMessageToChannel(guild.id, channelsID.deletedPost, `<@${record.authorID}> deleted ${record.postID}\n\n${postMsg.content}`);
            if (!deletedPostMsg) {
                return {
                    processed: false,
                    url: "",
                    newListingURL: "",
                    errorContent: "Unable to delete post message"
                };
            }

            const message = await postMsg.delete().catch(console.error);
            if (!message) {
                return {
                    processed: false,
                    url: "",
                    newListingURL: "",
                    errorContent: "Unable to delete post message"
                };
            }
            const msgURL = PostModel.generateUrl(message.channel.id, message.id);

            PostModel.deletes(
                data.postID,
                data.deleteDate
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

        return {
            processed: false,
            url: "",
            newListingURL: "",
            errorContent: "Invalid! Post/ID does not exist."
        };

    }

    async doModalDataProcess(interaction: ModalSubmitInteraction): Promise<void> {
        const { guild } = interaction;
        if (!guild) return;

        const fields = interaction.fields.fields;
        const postID = fields.keys().next().value;
        let data = {
            postID: (postID && postID != "have" ? postID : undefined),
            deleteDate: new Date(interaction.createdAt).toString()
        };
        let deleteResult;

        data = this.cleanUserEntries(data);

        const result: ProcessResult | void = await this.doProcess(
            guild, data
        ).catch(console.error);

        if (!result) return;
        const { processed, errorContent } = result;

        if (processed)
            deleteResult = `Your post has been deleted`;
        else
            deleteResult = errorContent;

        this.dUtil.postProcess(interaction, processed, deleteResult, false, null);
    }
}