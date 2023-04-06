const { BasePostManager } = require('./BasePostManager');
const { SoldPostModal } = require('../modal/SoldPostModal');

class SoldPostManager extends BasePostManager {
    constructor(client) {
        super(client);
    }

    async doModal(interaction, argPostID) {
        let { guild, user, channelId } = interaction;
        let post = await this.getValidPostRecord(argPostID, channelId, guild);

        if (post) {
            const errors = this.postUpdatePreValidations(post, user.id, post.authorID, guild);
            if (errors) return errors;

            let modal = new SoldPostModal(post.type, post.postID, post.have, post.want);
            if (modal) return this.successModal(modal);
            else return this.failModal();
        }
        else return this.invalidPost();
    }

    async doProcess(guild, data) {
        let record = Post.get(data.postID);
        const newListingsCh = channelsID.newListings;

        if (record) {
            const channelID = Post.getChannelFromType(record.type);
            const postMsg = await dUtil.getMessageFromID(guild, channelID, data.postID).catch(console.error);

            if (!postMsg) {
                return {
                    sold: false,
                    url: "",
                    errorContent: "Unable to fetch message from channel."
                };
            }

            let newContent = `||${postMsg.content}||`;

            const message = await postMsg.edit(newContent).catch(console.error);
            if (!message) {
                return {
                    sold: false,
                    url: "",
                    errorContent: "Unable to mark post as sold"
                };
            }
            let msgURL = Post.generateUrl(message.channel.id, message.id);

            Post.markSold(
                data.postID,
                data.soldDate
            );

            record.newListID.map(async (x) => {
                await dUtil.makeMessageSpoiler(guild.client, guild.id, newListingsCh, x);
            });

            return {
                sold: true,
                url: msgURL,
                errorContent: ""
            };
        }
        else {
            return {
                sold: false,
                url: "",
                errorContent: "Invalid! Post/ID does not exist."
            };
        }
    }

    async doModalDataProcess(interaction) {
        const fields = interaction.fields.fields;
        let data = {};
        let soldResult;

        const postID = fields.keys().next().value;
        if (postID && postID != "have")
            data.postID = postID;
        data.soldDate = new Date(interaction.createdAt).toString();

        data = this.cleanUserEntries(data);

        const { sold, url, errorContent } = await this.doProcess(
            interaction.guild, data
        ).catch(console.error);

        if (sold)
            soldResult = `Your post has been marked sold:\n${url}`;
        else
            soldResult = errorContent;

        dUtil.postProcess(interaction, sold, soldResult, false, null);
    }
}

module.exports = { SoldPostManager }