const { DiscordAPIError } = require('discord.js');
const { me_id, channelID } = require('../json/config.json');
const dUtil = require('../util/DiscordUtil');

class ModalProcessor {
  constructor() { }

  async processModal(interaction, postmngr) {
    switch (interaction.customId) {
      case "buyPostModal":
      case "sellPostModal":
      case "tradePostModal": this.processPostModal(interaction, postmngr); break;
      case "editPostModal": this.processEditPostModal(interaction, postmngr); break;
      case "soldPostModal": this.processSoldPostModal(interaction, postmngr); break;
      case "deletePostModal": this.processDeletePostModal(interaction, postmngr); break;
    }
  }

  async processPostModal(interaction, postmngr) {
    const authorID = interaction.user.id;
    const postDate = interaction.createdAt;

    const type = interaction.customId.replace("PostModal", "");
    const fields = interaction.fields.fields;
    let data = {};

    const roleID = fields.keys().next().value;
    if (roleID && roleID != "have")
      data.roleID = roleID;
    data.have = fields.get("have").value;
    data.want = fields.get("want").value;

    if (fields.has("imgur")) data.imgur = fields.get("imgur").value;
    if (fields.has("details")) data.details = fields.get("details").value;

    data = this.cleanUserEntries(data);

    const { posted, url, newListingURL } = await postmngr.newPost(
      interaction.client, interaction.guild, type, authorID, postDate, data
    );
    dUtil.postProcess(interaction, posted, `Your item has been listed:\n${url}\nNew listing:${newListingURL}`, false, null);
  }

  async processEditPostModal(interaction, postmngr) {
    const authorID = interaction.user.id;
    const fields = interaction.fields.fields;
    let data = {};
    let editResult;

    const postID = fields.keys().next().value;
    if (postID && postID != "have")
      data.postID = postID;
    data.have = fields.get("have").value;
    data.want = fields.get("want").value;
    data.editDate = interaction.createdAt;

    data = this.cleanUserEntries(data);

    const { edited, url, newListingURL, errorContent } = await postmngr.editPost(
      interaction.client, interaction.guild, authorID, data
    ).catch(console.error);

    if (edited)
      editResult = `Your post has been edited:\n${url}\nUpdated notif: ${newListingURL}`;
    else
      editResult = errorContent;

      dUtil.postProcess(interaction, edited, editResult, false, null);
  }

  async processSoldPostModal(interaction, postmngr) {
    const fields = interaction.fields.fields;
    let data = {};
    let soldResult;

    const postID = fields.keys().next().value;
    if (postID && postID != "have")
      data.postID = postID;
    data.soldDate = interaction.createdAt;

    data = this.cleanUserEntries(data);

    const { sold, url, errorContent } = await postmngr.soldPost(
      interaction.guild, data
    ).catch(console.error);

    if (sold)
      soldResult = `Your post has been marked sold:\n${url}`;
    else
      soldResult = errorContent;

      dUtil.postProcess(interaction, sold, soldResult, false, null);
  }

  async processDeletePostModal(interaction, postmngr) {
    const fields = interaction.fields.fields;
    let data = {};
    let deleteResult;

    const postID = fields.keys().next().value;
    if (postID && postID != "have")
      data.postID = postID;
    data.deleteDate = interaction.createdAt;

    data = this.cleanUserEntries(data);

    const { deleted, url, errorContent } = await postmngr.deletePost(
      interaction.guild, data
    ).catch(console.error);

    if (deleted)
      deleteResult = `Your post has been deleted`;
    else
      deleteResult = errorContent;

    dUtil.postProcess(interaction, deleted, deleteResult, false, null);
  }

  cleanUserEntries(data) {
    Object.keys(data).forEach(x => {
      if (x === "details") return;
      data[x] = data[x].toString().replace("\n", " ");
    });
    return data;
  }
}

module.exports = { ModalProcessor }