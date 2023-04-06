const { BasePostManager } = require('./BasePostManager');
const { DeletePostModal } = require('../modal/DeletePostModal');

class DeletePostManager extends BasePostManager {
    constructor(client) {
        super(client);
    }

    async doModal(interaction, argPostID) {
        let { guild, user, channelId } = interaction;
        let post = await this.getValidPostRecord(argPostID, channelId, guild);

        if (post) {
            const errors = this.postUpdatePreValidations(post, user.id, post.authorID, guild);
            if (errors) return errors;

            let modal = new DeletePostModal(post.type, post.postID, post.have, post.want);
            if (modal) return this.successModal(modal);
            else return this.failModal();
        }
        else return this.invalidPost();
    }

    async doProcess(guild, data) {
        const newListingsCh = channelsID.newListings;
        let record = Post.get(data.postID);

        if (record) {
            const channelID = Post.getChannelFromType(record.type);
            const postMsg = await dUtil.getMessageFromID(guild, channelID, data.postID).catch(console.error);

            if (!postMsg) {
                return {
                    deleted: false,
                    url: "",
                    errorContent: "Unable to fetch message from channel."
                };
            }

            const deletedPostMsg = await dUtil.sendMessageToChannel(guild.client, guild.id, channelsID.deletedPost, `<@${record.authorID}> deleted ${record.postID}\n\n${postMsg.content}`);
            if (!deletedPostMsg) {
                return {
                    deleted: false,
                    url: "",
                    errorContent: "Unable to delete post message"
                };
            }

            const message = await postMsg.delete().catch(console.error);
            if (!message) {
                return {
                    deleted: false,
                    url: "",
                    errorContent: "Unable to delete post message"
                };
            }
            let msgURL = Post.generateUrl(message.channel.id, message.id);

            Post.delete(
                data.postID,
                data.deleteDate
            );

            record.newListID.map(async (x) => {
                await dUtil.makeMessageSpoiler(guild.client, guild.id, newListingsCh, x);
            });

            return {
                deleted: true,
                url: msgURL,
                errorContent: ""
            };
        }
        else {
            return {
                deleted: false,
                url: "",
                errorContent: "Invalid! Post/ID does not exist."
            };
        }
    }

    async doModalDataProcess(interaction) {
        const fields = interaction.fields.fields;
        let data = {};
        let deleteResult;

        const postID = fields.keys().next().value;
        if (postID && postID != "have")
            data.postID = postID;
        data.deleteDate = new Date(interaction.createdAt).toString();

        data = this.cleanUserEntries(data);

        const { deleted, url, errorContent } = await this.doProcess(
            interaction.guild, data
        ).catch(console.error);

        if (deleted)
            deleteResult = `Your post has been deleted`;
        else
            deleteResult = errorContent;

        dUtil.postProcess(interaction, deleted, deleteResult, false, null);
    }
}

module.exports = { DeletePostManager }