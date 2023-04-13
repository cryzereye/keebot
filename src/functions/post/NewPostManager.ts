import { ChatInputCommandInteraction, Guild, ModalSubmitInteraction, Snowflake } from "discord.js";
import { TransactionType } from "../../models/enums/TransactionType.js";

import { channelsID, dev } from '../../../json/config.json';
import { NewPostModal } from '../modal/NewPostModal.js';
import { BasePostManager } from './BasePostManager.js';

import { Post } from "../../models/Post.js";
import { PostRepository } from "../../repository/PostRepository.js";
import { ProcessResult } from "../types/ProcessResult.js";

export class NewPostManager extends BasePostManager {
    constructor(repo: PostRepository) {
        super(repo);
    }

    doModal(interaction: ChatInputCommandInteraction) {
        const type = interaction.options.getString('type');
        const itemrole = interaction.options.getRole('itemrole');

        const modal = new NewPostModal(Post.getTransactionType(type), itemrole);
        if (modal)
            return this.successModal(modal);
        else {
            return {
                success: false,
                content: "**INVALID ITEM ROLE**",
                isModal: false,
                modal: null
            }
        }
    }

    async doProcess(guild: Guild, type: TransactionType, authorID: Snowflake, postDate: Date, data: any): Promise<ProcessResult> {
        const channelID = Post.getChannelFromType(type);
        let content = "";
        let newListContent = "";
        let msgURL = "";

        const errors = this.haveWantValidation(type, data.have, data.want);
        if (errors) return errors;

        // goes into buy/sell/trade channel
        content += `**Post by <@!${authorID}>**\n\n`;
        content += `HAVE: ${data.have}\n`;
        content += `WANT: ${data.want}\n`;
        if ("imgur" in data)
            content += `${data.imgur}\n\n`;

        if ("details" in data)
            content += `${data.details}\n`;

        // goes into new-listings channel
        newListContent += `**New <#${channelID}> post from <@!${authorID}>**\n`;
        if (data.roleID)
            newListContent += `For <@&${data.roleID}>\n`;
        newListContent += `HAVE:  ${data.have}\n`;
        newListContent += `WANT:  ${data.want}\n`;

        // gets sent message from buy/sell/trade channels then gets id, generates url to be sent in #new-listings
        const message = await DUTIL.sendMessageToChannel(guild.id, channelID, content);
        if (!message) {
            return {
                processed: false,
                url: "",
                newListingURL: "",
                errorContent: "Error in generation"
            };
        }

        msgURL = Post.generateURL(channelID, message.id);
        newListContent += `${msgURL}`;

        const ch = channelsID.newListings;
        const newListMsg = await DUTIL.sendMessageToChannel(guild.id, ch, newListContent);

        let bumpDate: Date;
        let expiryDate: Date;

        if (dev) {
            bumpDate = UTIL.addHours(postDate, Math.floor(Math.random() * 4)); // randoms 0-4 minutes
            expiryDate = UTIL.addHours(postDate, 10); // 10 minutes post expiry
        }
        else {
            bumpDate = UTIL.addHours(postDate, 8 + Math.floor(Math.random() * 4)); // randoms 8-12 hours
            expiryDate = UTIL.addHours(postDate, 24 * 60); // 60 days post expiry
        }

        this.repo.new(
            new Post(
                message.id,
                (newListMsg ? newListMsg.id : ""),
                authorID,
                type,
                data.roleID,
                data.have,
                data.want,
                postDate,
                bumpDate,
                expiryDate
            )
        );

        return {
            processed: true,
            url: msgURL,
            newListingURL: Post.generateURL(ch, (newListMsg ? newListMsg.id : "")),
            errorContent: ""
        };
    }

    async doModalDataProcess(interaction: ModalSubmitInteraction) {
        const { guild, user, fields, customId } = interaction;
        if (!(guild && user && fields && fields.fields)) return;

        const authorID = user.id;
        const extracted = fields.fields;
        if (extracted.size <= 0) return;

        const postDate = new Date(interaction.createdAt);
        const inputType: string = customId.replace("PostModal", "");
        const type = Post.getTransactionType(inputType);
        const roleID = extracted.keys().next().value;
        const have = extracted.get("have");
        const want = extracted.get("want");
        const imgur = extracted.get("imgur");
        const details = extracted.get("details");

        let data = {
            "roleID": (roleID && roleID != "have" ? roleID : null),
            "have": (have ? have.value : ""),
            "want": (want ? want.value : ""),
            "imgur": (imgur ? imgur.value : ""),
            "details": (details ? details.value : ""),
            "editDate": new Date(interaction.createdAt).toString()
        };
        let postResult;

        data = this.cleanUserEntries(data);

        const { processed, url, newListingURL, errorContent } = await this.doProcess(
            guild, type, authorID, postDate, data
        );

        if (processed)
            postResult = `Your item has been listed:\n${url}\nNew listing:${newListingURL}`;
        else
            postResult = errorContent;

        await DUTIL.postProcess(interaction, processed, postResult, false, null);
    }
}