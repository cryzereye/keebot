class ModalProcessor {
  constructor() { }

  async processModal(interaction, postmngr) {
    switch (interaction.customId) {
      case "buyPostModal":
      case "sellPostModal":
      case "tradePostModal": this.processPostModal(interaction, postmngr); break;
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

    const { posted, url, newListingURL } = await postmngr.newPost(
      interaction.client, interaction.guild, type, authorID, postDate, data
    ); 

    if(posted){
      await interaction.reply({
        content: `Your item has been listed:\n${url}\nNew listing:${newListingURL}`,
        ephemeral: true
      });
    }

    
  }

}

module.exports = { ModalProcessor }