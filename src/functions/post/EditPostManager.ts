const { BasePostManager } = require('./BasePostManager');
const { EditPostModal } = require('../modal/EditPostModal');

class EditPostManager extends BasePostManager {
    constructor(client) {
        super(client);
    }

    async doModal(interaction, argPostID) {
        let { guild, user, channelId } = interaction;
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

    async doProcess(guild, authorID, data) {
        let record = Post.get(data.postID);

        if (record) {
            const channelID = Post.getChannelFromType(record.type);
            const postMsg = await dUtil.getMessageFromID(guild, channelID, data.postID).catch(console.error);

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

            content.map(line => {
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
            let msgURL = Post.generateUrl(message.channel.id, message.id);

            if (record.authorID !== authorID)
                newListContent += `**UPDATED <#${channelID}> post by Mod <@!${authorID}> in behalf of <@${record.authorID}>**\n`;
            else
                newListContent += `**UPDATED <#${channelID}> post from <@!${authorID}>**\n`;

            newListContent += "HAVE: " + (haveEdited ? `~~${record.have}~~` : "") + ` ${data.have}\n`;
            newListContent += "WANT: " + (wantEdited ? `~~${record.want}~~` : "") + ` ${data.want}\n`;
            newListContent += `${msgURL}`;

            let ch = channelsID.newListings;
            const newListMsg = await dUtil.sendMessageToChannel(this.client, guild.id, ch, newListContent).catch(console.error);

            if (newListMsg) {
                Post.edit(
                    data.postID,
                    data.have,
                    data.want,
                    data.editDate,
                    newListMsg.id
                );
            }
            else {
                Post.edit(
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
                newListingURL: Post.generateUrl(ch, newListMsg.id),
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

    async doModalDataProcess(interaction) {
        const authorID = interaction.user.id;
        const fields = interaction.fields.fields;
        let data = {};
        let editResult;

        const postID = fields.keys().next().value;
        if (postID && postID != "have")
            data.postID = postID;
        data.have = fields.get("have").value;
        data.want = fields.get("want").value;
        data.editDate = new Date(interaction.createdAt).toString();

        data = this.cleanUserEntries(data);

        const { edited, url, newListingURL, errorContent } = await this.doProcess(
            interaction.client, interaction.guild, authorID, data
        ).catch(console.error);

        if (edited)
            editResult = `Your post has been edited:\n${url}\nUpdated notif: ${newListingURL}`;
        else
            editResult = errorContent;

        dUtil.postProcess(interaction, edited, editResult, false, null);
    }
}

module.exports = { EditPostManager }