const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { relevant_roles, newListingsCHID, testCHID } = require('../json/config.json');
const Post = require('../models/Post');
const dUtil = require('../util/DiscordUtil');

class PostManager {
  constructor() { }

  buildRoleField(itemrole) {
    const role = new TextInputBuilder()
      .setCustomId(itemrole.id.toString())
      .setLabel("Item Role [DO NOT EDIT ROLE]")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(itemrole.id.toString())
      .setValue(itemrole.name);
    return role;
  }

  buildHaveField() {
    const have = new TextInputBuilder()
      .setCustomId('have')
      .setLabel("Have")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('H:')
      .setRequired(true);
    return have;
  }

  buildWantField() {
    const want = new TextInputBuilder()
      .setCustomId('want')
      .setLabel("Want")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('W:')
      .setRequired(true);
    return want;
  }

  buildImgurField() {
    const imgur = new TextInputBuilder()
      .setCustomId('imgur')
      .setLabel("Imgur Link")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('https://imgur.com/a/xxxxxxxxxxx')
      .setRequired(false);
    return imgur;
  }

  buildDetailsField() {
    const want = new TextInputBuilder()
      .setCustomId('details')
      .setLabel("Details")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(1000)
      .setMinLength(1)
      .setPlaceholder('Enter post details here...')
      .setRequired(false);
    return want;
  }

  async newPostModal(interaction) {
    let modal = new ModalBuilder();
    let components = [
      new ActionRowBuilder().addComponents(this.buildHaveField()),
      new ActionRowBuilder().addComponents(this.buildWantField()),
      new ActionRowBuilder().addComponents(this.buildImgurField()),
      new ActionRowBuilder().addComponents(this.buildDetailsField())
    ];

    const type = interaction.options.getString('type');
    const itemrole = interaction.options.getRole('itemrole');

    if (itemrole) {
      if (relevant_roles.includes(itemrole.name))
        return await interaction.reply({
          content: "**INVALID ITEM ROLE**",
          ephemeral: true
        }).catch(console.error);
      modal.addComponents(new ActionRowBuilder().addComponents(this.buildRoleField(itemrole)));
    }
    switch (type) {
      case "buy": {
        modal.setCustomId("buyPostModal").setTitle("Buy an item!");
        break;
      }
      case "sell": {
        modal.setCustomId("sellPostModal").setTitle("Sell an item!");
        break;
      }
      case "trade": {
        modal.setCustomId("tradePostModal").setTitle("Trade an item!");
        break;
      }
    }
    modal.addComponents(components);
    await interaction.showModal(modal).catch(console.error);
  }

  async newPost(client, guild, type, authorID, postDate, data) {
    let channelID = testCHID; // test purposes only
    let content = "";
    let newListContent = "";
    let msgURL = "";
    /**switch (type) {
      case "buy": channelID = sellCHID; break;
      case "sell": channelID = buyCHID; break;
      case "trade": channelID = tradeCHID; break;
    }*/

    // goes into buy/sell/trade channel
    content += `**Post by <@${authorID}>**\n\n`;
    content += `HAVE: ${data.have}\n`;
    content += `WANT: ${data.want}\n`;
    if ("imgur" in data)
      content += `${data.imgur}\n\n`;

    if ("details" in data)
      content += `${data.details}\n`;

    // goes into new-listings channel
    newListContent += `New <#${channelID}> post from <@${authorID}>**\n`;
    if ("roleID" in data)
      newListContent += `For <@&${data.roleID}>\n`;
    newListContent += `HAVE:  ${data.have}\n`;
    newListContent += `WANT:  ${data.want}\n`;

    // gets sent message from buy/sell/trade channels then gets id, generates url to be sent in #new-listings
    const message = await dUtil.sendMessageToChannel(client, guild.id, channelID, content);
    msgURL = Post.generateUrl(channelID, message.id);
    newListContent += `${msgURL}`;

    const newListMsg = await dUtil.sendMessageToChannel(client, guild.id, newListingsCHID, newListContent);

    Post.new(
      message.id,
      newListMsg.id,
      authorID,
      type,
      data.have,
      data.want,
      postDate
    );

    return {
      posted: true,
      url: msgURL,
      newListingURL: Post.generateUrl(newListingsCHID, newListMsg.id),
    };
  }

  editPost() { }

  markSoldPost() { }

  deletePost() { }
}

module.exports = { PostManager }