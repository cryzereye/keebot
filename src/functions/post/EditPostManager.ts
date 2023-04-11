import { BaseInteraction, ChatInputCommandInteraction, Client, Guild, ModalSubmitInteraction, Snowflake } from "discord.js";
import { DiscordUtilities } from "../../util/DiscordUtilities";
import { PostResult } from "../../processor/types/PostResult";

const { BasePostManager } = require('./BasePostManager');
const { EditPostModal } = require('../modal/EditPostModal');

import PostModel = require('../../models/PostModel');
const { channelsID } = require('../../../json/config.json');

export class EditPostManager extends BasePostManager {
    constructor(client: Client, dUtil: DiscordUtilities) {
        super(client, dUtil);
    }

    async doModal(interaction: BaseInteraction, argPostID: Snowflake): Promise<PostResult> {
        let { guild, user, channelId } = interaction;
        if (!(guild && user && channelId)) return this.invalidPost();
        let post = await this.getValidPostRecord(argPostID, channelId, guild);

        if (post) {
            const errors = await this.postUpdatePreValidations(post, user.id, post.authorID, guild);
            if (errors) return errors;

            let modal = new EditPostModal(post.type, null, post.postID, post.have, post.want);
            if (modal) return this.successModal(modal);
            else return this.failModal();
        }
        else return this.invalidPost();
    }

    async doProcess(guild: Guild, authorID: Snowflake, data: any) {
        let record = PostModel.get(data.postID);

        if (record) {
            const channelID = PostModel.getChannelFromType(record.type);
            const postMsg = await this.dUtil.getMessageFromID(guild, channelID, data.postID).catch(console.error);

            if (!postMsg) {
                return {
                    edited: false,
                    url: "",
                    newListingURL: "",
                    errorContent: "Unable to fetch message from channel."
                };
            }

            const errors = this.haveWantValidation(record.type, data.have, data.want);
            if (errors) return errors;

            let content = postMsg.content.split('\n');
            let newContent = "";
            let newListContent = "";
            let haveEdited = (record.have !== data.have);
            let wantEdited = (record.want !== data.want);

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
                    edited: false,
                    url: "",
                    newListingURL: "",
                    errorContent: ""
                };
            }
            let msgURL = PostModel.generateUrl(message.channel.id, message.id);

            if (record.authorID !== authorID)
                newListContent += `**UPDATED <#${channelID}> post by Mod <@!${authorID}> in behalf of <@${record.authorID}>**\n`;
            else
                newListContent += `**UPDATED <#${channelID}> post from <@!${authorID}>**\n`;

            newListContent += "HAVE: " + (haveEdited ? `~~${record.have}~~` : "") + ` ${data.have}\n`;
            newListContent += "WANT: " + (wantEdited ? `~~${record.want}~~` : "") + ` ${data.want}\n`;
            newListContent += `${msgURL}`;

            let ch = channelsID.newListings;
            const newListMsg = await this.dUtil.sendMessageToChannel(this.client, guild.id, ch, newListContent).catch(console.error);

            if (newListMsg) {
                PostModel.edit(
                    data.postID,
                    data.have,
                    data.want,
                    data.editDate,
                    newListMsg.id
                );
            }
            else {
                PostModel.edit(
                    data.postID,
                    data.have,
                    data.want,
                    data.editDate,
                    ""
                );
            }


            return {
                edited: true,
                url: msgURL,
                newListingURL: PostModel.generateUrl(ch, newListMsg.id),
                errorContent: ""
            };
        }
        else {
            return {
                edited: false,
                url: "",
                newListingURL: "",
                errorContent: "Invalid! Post/ID does not exist."
            };
        }
    }

    async doModalDataProcess(interaction: ModalSubmitInteraction) {
        const {guild, user, fields} = interaction;
        if(!(guild && user && fields && fields.fields)) return;
        
        const authorID = user.id;
        const extracted = fields.fields;
        if(extracted.size <= 0 ) return;

        const postID = extracted.keys().next().value;
        const have = extracted.get("have");
        const want = extracted.get("want");

        let data = {
            postID: (postID && postID != "have" ? postID : ""),
            have: (have ? have.value: ""),
            want: (want ? want.value: ""),
            editDate: new Date(interaction.createdAt).toString()
        };
        let editResult;

        data = this.cleanUserEntries(data);

        const { edited, url, newListingURL, errorContent } = await this.doProcess(
            guild, authorID, data
        ).catch(console.error);

        if (edited)
            editResult = `Your post has been edited:\n${url}\nUpdated notif: ${newListingURL}`;
        else
            editResult = errorContent;

        this.dUtil.postProcess(interaction, edited, editResult, false, null);
    }
}