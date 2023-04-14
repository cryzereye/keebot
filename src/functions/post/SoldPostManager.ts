import { BaseInteraction, Guild, ModalSubmitInteraction, Snowflake } from "discord.js";
import { Post } from "../../models/Post.js";
import { PostResult } from "../../processor/types/PostResult.js";
import { PostRepository } from "../../repository/PostRepository.js";
import { SoldPostModal } from '../modal/SoldPostModal.js';
import { ModalData } from "../types/ModalData.js";
import { ProcessResult } from "../types/ProcessResult.js";
import { BasePostManager } from './BasePostManager.js';

export class SoldPostManager extends BasePostManager {
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

            const modal = new SoldPostModal(post.type, post.postID, post.have, post.want);
            if (modal) return this.successModal(modal);
            else return this.failModal();
        }
        else return this.invalidPost();
    }

    async doProcess(guild: Guild, data: ModalData): Promise<ProcessResult> {
        const newListingsCh = CONFIG.data.channelsID.newListings;

        if (!data.postID) return {
            processed: false,
            url: "",
            newListingURL: "",
            errorContent: "Invalid post"
        };

        const record = this.repo.find(data.postID);

        if (record) {
            const channelID = Post.getChannelFromType(record.type);
            const postMsg = await DUTIL.getMessageFromID(guild, channelID, data.postID).catch(console.error);

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

            record.sold();

            record.newListID.map(async (x: Snowflake) => {
                await DUTIL.makeMessageSpoiler(guild.id, newListingsCh, x);
            });

            return {
                processed: true,
                url: record.URL,
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
        let data: ModalData = {
            postID: (postID && postID != "have" ? postID : undefined),
            roleID: undefined,
            have: undefined,
            want: undefined,
            imgur: undefined,
            details: undefined
        };
        let soldResult;

        data = this.cleanUserEntries(data);

        const result: ProcessResult | void = await this.doProcess(
            guild, data
        ).catch(console.error);

        if (!result) return;
        const { processed, url, errorContent } = result;

        if (processed)
            soldResult = `Your post has been marked sold:\n${url}`;
        else
            soldResult = errorContent;

        DUTIL.postProcess(interaction, processed, soldResult, false, null);
    }
}