import { BaseInteraction, Guild, ModalSubmitInteraction, Snowflake } from "discord.js";
import { Post } from "../../models/Post.js";
import { PostResult } from "../../processor/types/PostResult.js";
import { PostRepository } from "../../repository/PostRepository.js";
import { EditPostModal } from '../modal/EditPostModal.js';
import { ProcessResult } from "../types/ProcessResult.js";
import { BasePostManager } from './BasePostManager.js';

import { channelsID } from '../../../json/config.json' assert { type: "json" };
import { ModalData } from "../types/ModalData.js";

export class EditPostManager extends BasePostManager {
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

            const modal = new EditPostModal(post.type, post.postID, post.have, post.want);
            if (modal) return this.successModal(modal);
            else return this.failModal();
        }
        else return this.invalidPost();
    }

    async doProcess(guild: Guild, authorID: Snowflake, data: ModalData): Promise<ProcessResult> {
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

            const errors = this.haveWantValidation(
                record.type,
                (data.have ? data.have : ""),
                (data.want ? data.want : "")
            );
            if (errors) return errors;

            const content = postMsg.content.split('\n');
            let newContent = "";
            let newListContent = "";
            const haveEdited = (record.have !== data.have);
            const wantEdited = (record.want !== data.want);

            content.map((line: string) => {
                if (line.startsWith("HAVE: ") && !haveEdited)
                    newContent += `HAVE: ${data.have}\n`;
                else if (line.startsWith("WANT: ") && !wantEdited)
                    newContent += `WANT: ${data.want}\n`;
                else
                    newContent += line + "\n"
            });

            const message = await postMsg.edit(newContent).catch(console.error);
            if (!message) {
                return {
                    processed: false,
                    url: "",
                    newListingURL: "",
                    errorContent: ""
                };
            }

            if (record.authorID !== authorID)
                newListContent += `**UPDATED <#${channelID}> post by Mod <@!${authorID}> in behalf of <@${record.authorID}>**\n`;
            else
                newListContent += `**UPDATED <#${channelID}> post from <@!${authorID}>**\n`;

            newListContent += "HAVE: " + (haveEdited ? `~~${record.have}~~` : "") + ` ${data.have}\n`;
            newListContent += "WANT: " + (wantEdited ? `~~${record.want}~~` : "") + ` ${data.want}\n`;
            newListContent += `${record.URL}`;

            const ch = channelsID.newListings;
            const newListMsg = await DUTIL.sendMessageToChannel(guild.id, ch, newListContent).catch(console.error);

            if (newListMsg) {
                this.repo.edit(
                    data.postID,
                    (data.have ? data.have : ""),
                    (data.want ? data.want : ""),
                    newListMsg.id
                );
            }
            else {
                this.repo.edit(
                    data.postID,
                    (data.have ? data.have : ""),
                    (data.want ? data.want : ""),
                    ""
                );
            }


            return {
                processed: true,
                url: record.URL,
                newListingURL: Post.generateURL(ch, (newListMsg ? newListMsg.id : "")),
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
        const { guild, user, fields } = interaction;
        if (!(guild && user && fields && fields.fields)) return;

        const authorID = user.id;
        const extracted = fields.fields;
        if (extracted.size <= 0) return;

        const postID = extracted.keys().next().value;
        const have = extracted.get("have");
        const want = extracted.get("want");

        let data: ModalData = {
            postID: (postID && postID != "have" ? postID : ""),
            roleID: undefined,
            have: (have ? have.value : ""),
            want: (want ? want.value : ""),
            imgur: undefined,
            details: undefined
        };
        let editResult;

        data = this.cleanUserEntries(data);

        const { processed, url, newListingURL, errorContent } = await this.doProcess(
            guild, authorID, data
        );

        if (processed)
            editResult = `Your post has been edited:\n${url}\nUpdated notif: ${newListingURL}`;
        else
            editResult = errorContent;

        DUTIL.postProcess(interaction, processed, editResult, false, null);
    }
}