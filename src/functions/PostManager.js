const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { relevant_roles } = require('../json/config.json');

class PostManager {
  constructor() {
    this.modal = new ModalBuilder();
    this.components = [
      new ActionRowBuilder().addComponents(this.buildHaveField()),
      new ActionRowBuilder().addComponents(this.buildWantField()),
      new ActionRowBuilder().addComponents(this.buildImgurField()),
      new ActionRowBuilder().addComponents(this.buildDetailsField())
    ];
  }

  buildRoleField(itemrole) {
    const role = new TextInputBuilder()
      .setCustomId('role')
      .setLabel("Item Role [DO NOT EDIT ROLE]")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(itemrole.id.toString())
      .setValue(itemrole.name)
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
    const type = interaction.options.getString('type');
    const itemrole = interaction.options.getRole('itemrole');

    if(relevant_roles.includes(itemrole.name))
      return await interaction.reply("**INVALID ITEM ROLE**").catch(console.error);

    switch (type) {
      case "buy": {
        this.modal.setCustomId("buyPostModal").setTitle("Buy an item!");
        break;
      }
      case "sell": {
        this.modal.setCustomId("sellPostModal").setTitle("Sell an item!");
        break;
      }
      case "trade": {
        this.modal.setCustomId("tradePostModal").setTitle("Trade an item!");
        break;
      }
    }

    this.modal.addComponents(new ActionRowBuilder().addComponents(this.buildRoleField(itemrole)));
    this.modal.addComponents(this.components);
    await interaction.showModal(this.modal).catch(console.error);
  }

  newPost() { }

  editPost() { }

  markSoldPost() { }

  deletePost() { }
}

module.exports = { PostManager }