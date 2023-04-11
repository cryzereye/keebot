import { ChatInputCommandInteraction, Client } from "discord.js";
import { DiscordUtilities } from "../../util/DiscordUtilities";
import { Post } from "../../models/types/Post";

const { BasePostManager } = require('./BasePostManager');

import PostModel = require('../../models/PostModel');
import util = require('../../util/Utilities');

export class ListPostManager extends BasePostManager {
    constructor(client: Client, dUtil: DiscordUtilities) {
        super(client, dUtil);
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
        let records = PostModel.list(authorID, itemroleID, util.getTransactionType(type));
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

        records.map((x: Post) => {
            channel = PostModel.getChannelFromType(x.type);
            let newContent = `<#${channel}>\nHAVE: ${x.have}\nWANT: ${x.want}\n${PostModel.generateUrl(channel, x.postID)}\nExpires ${x.expiryDate}\n\n`;
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