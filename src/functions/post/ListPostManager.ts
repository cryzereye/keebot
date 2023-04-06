const { BasePostManager } = require('./BasePostManager');

class ListPostManager extends BasePostManager {
    constructor(client) {
        super(client);
    }

    async doProcess(interaction) {
        const author = interaction.options.getUser("user");
        const itemrole = interaction.options.getRole("listitemrole");
        const type = interaction.options.getString("type");
        let authorID = "";
        let itemroleID = "";
        if (author) authorID = author.id;
        if (itemrole) itemroleID = itemrole.id;

        if (authorID == "" && itemroleID == "") {
            authorID = interaction.user.id;
        }
        let records = Post.list(authorID, itemroleID, type);
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

        records.map(x => {
            channel = Post.getChannelFromType(x.type);
            let newContent = `<#${channel}>\nHAVE: ${x.have}\nWANT: ${x.want}\n${Post.generateUrl(channel, x.postID)}\nExpires ${x.expiryDate}\n\n`;
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

module.exports = { ListPostManager }