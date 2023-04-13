import { ChatInputCommandInteraction } from "discord.js";
import { PostType } from "../../models/types/PostType.js";

import * as BasePostManager from './BasePostManager.js';

import * as PostModel from '../../repository/PostRepository.js';
import * as util from '../../util/Utilities.js';

export class ListPostManager extends BasePostManager.BasePostManager {
    constructor() {
        super();
    }

    async doProcess(interaction: ChatInputCommandInteraction) {
        const author = interaction.options.getUser("user");
        const itemrole = interaction.options.getRole("listitemrole");
        const inputType = interaction.options.getString("type");
        let authorID = "";
        let itemroleID = "";
        let type = "";
        if (author) authorID = author.id;
        if (itemrole) itemroleID = itemrole.id;
        if (inputType) type = inputType;

        if (authorID == "" && itemroleID == "") {
            authorID = interaction.user.id;
        }
        const records = PostModel.list(authorID, itemroleID, util.getTransactionType(type));
        let content = "";
        let channel;

        if (records.length === 0) {
            return {
                success: false,
                content: "No posts found related to either user or item role.",
                isModal: false,
                modal: null
            }
        }

        records.map((x: PostType) => {
            channel = PostModel.getChannelFromType(x.type);
            const newContent = `<#${channel}>\nHAVE: ${x.have}\nWANT: ${x.want}\n${PostModel.generateUrl(channel, x.postID)}\nExpires ${x.expiryDate}\n\n`;
            if (content.length + newContent.length <= 2000)
                content += newContent;
        });

        return {
            success: true,
            content: content,
            isModal: false,
            modal: null
        }
    }
}