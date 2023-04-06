const { BasePostManager } = require('./BasePostManager');
const { NewPostModal } = require('../modal/NewPostModal');

class NewPostManager extends BasePostManager {
    constructor(client) {
        super(client);
    }

    doModal(interaction) {
        const type = interaction.options.getString('type');
        const itemrole = interaction.options.getRole('itemrole');

        let modal = new NewPostModal(type, itemrole);
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

    async doProcess(guild, type, authorID, postDate, data) {
        let channelID = Post.getChannelFromType(type);
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
        if ("roleID" in data)
            newListContent += `For <@&${data.roleID}>\n`;
        newListContent += `HAVE:  ${data.have}\n`;
        newListContent += `WANT:  ${data.want}\n`;

        // gets sent message from buy/sell/trade channels then gets id, generates url to be sent in #new-listings
        const message = await dUtil.sendMessageToChannel(this.client, guild.id, channelID, content);
        msgURL = Post.generateUrl(channelID, message.id);
        newListContent += `${msgURL}`;

        let ch = channelsID.newListings;
        const newListMsg = await dUtil.sendMessageToChannel(this.client, guild.id, ch, newListContent);

        let bumpDate = util.addHours(postDate, 8 + Math.floor(Math.random() * 4)); // randoms 8-12 hours
        let expiryDate = util.addHours(postDate, 24 * 60); // 60 days post expiry

        if (dev) {
            bumpDate = util.addHours(postDate, Math.floor(Math.random() * 4)); // randoms 0-4 minutes
            expiryDate = util.addHours(postDate, 10); // 10 minutes post expiry
        }

        Post.new(
            message.id,
            newListMsg.id,
            authorID,
            type,
            data.roleID,
            data.have,
            data.want,
            postDate,
            bumpDate,
            expiryDate
        );

        return {
            posted: true,
            url: msgURL,
            newListingURL: Post.generateUrl(ch, newListMsg.id),
        };
    }

    async doModalDataProcess(interaction) {
        const authorID = interaction.user.id;
        const postDate = new Date(interaction.createdAt).toString();

        const type = interaction.customId.replace("PostModal", "");
        const fields = interaction.fields.fields;
        let data = {};
        let postResult;

        const roleID = fields.keys().next().value;
        if (roleID && roleID != "have")
            data.roleID = roleID;
        data.have = fields.get("have").value;
        data.want = fields.get("want").value;

        if (fields.has("imgur")) data.imgur = fields.get("imgur").value;
        if (fields.has("details")) data.details = fields.get("details").value;

        data = this.cleanUserEntries(data);

        const { posted, url, newListingURL, errorContent } = await this.doProcess(
            interaction.client, interaction.guild, type, authorID, postDate, data
        );

        if (posted)
            postResult = `Your item has been listed:\n${url}\nNew listing:${newListingURL}`;
        else
            postResult = errorContent;

        dUtil.postProcess(interaction, posted, postResult, false, null);
    }
}


module.exports = { NewPostManager }