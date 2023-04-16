import { ChatInputCommandInteraction } from "discord.js";
import { Post } from "../../models/Post.js";
import { PostRepository } from "../../repository/PostRepository.js";
import { BasePostManager } from './BasePostManager.js';

export class ListPostManager extends BasePostManager {
    constructor(repo: PostRepository) {
        super(repo);
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
        const records = this.repo.list(authorID, itemroleID, Post.getTransactionType(type));
        let content = "";
        let channel;

        if (records.length === 0) {
            return {
                success: false,
                content: "No posts found related to either user or item role.",
                modal: null
            }
        }

        records.map((x: Post) => {
            channel = Post.getChannelFromType(x.type);
            const newContent = `<#${channel}>\nHAVE: ${x.have}\nWANT: ${x.want}\n${x.URL}\nExpires ${x.expiryDate}\n\n`;
            if (content.length + newContent.length <= 2000)
                content += newContent;
        });

        return {
            success: true,
            content: content,
            modal: null
        }
    }

    async processResults(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply().catch(console.error);
        const { guild, user } = interaction;
        if (!(guild && user)) {
            await interaction.followUp({
                content: "Error in command. Contant @gego",
                ephemeral: true
            }).catch(console.error);
            return;
        }

        const { success, content } = await this.doProcess(interaction);
        if (!success)
            await DUTIL.sendMessageToChannel(guild.id, CONFIG.data.channelsID.keebotlogs, `<@${user.id}>\n${content}`);

        await interaction.followUp({
            content: content,
            ephemeral: true
        }).catch(console.error);
    }
}