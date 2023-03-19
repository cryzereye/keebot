const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { relevant_roles, channelsID, me_id, dev, admins } = require('../json/config.json');
const Post = require('../models/Post');
const dUtil = require('../util/DiscordUtil');
const util = require('../util/Utilities');
const { BumpManager } = require('./BumpManager');

class PostManager {
  constructor(client) {
    this.bumpmngr = new BumpManager(client);
    this.bumpmngr.startService();
  }

  async newPostModal(interaction) {
    const type = interaction.options.getString('type');
    const itemrole = interaction.options.getRole('itemrole');

    let modal = this.generateModal("new", type, itemrole);
    if (modal)
      return {
        success: true,
        content: "",
        isModal: true,
        modal: modal
      }
    else {
      return {
        success: false,
        content: "**INVALID ITEM ROLE**",
        isModal: false,
        modal: null
      }
    }
  }

  async newPost(client, guild, type, authorID, postDate, data) {
    let channelID = Post.getChannelFromType(type);
    let content = "";
    let newListContent = "";
    let msgURL = "";

    switch(type){
      case "sell": {
        if(!util.isValidAmount(data.want)){
          return {
            posted: false,
            url: "",
            errorContent: "WANT should be a valid amount"
          };
        }
        break;
      }
      case "buy": {
        if(!util.isValidAmount(data.have)){
          return {
            posted: false,
            url: "",
            errorContent: "HAVE should be a valid amount"
          };
        }
        break;
      }
    }

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
    const message = await dUtil.sendMessageToChannel(client, guild.id, channelID, content);
    msgURL = Post.generateUrl(channelID, message.id);
    newListContent += `${msgURL}`;

    let ch = channelsID.newListings;
    const newListMsg = await dUtil.sendMessageToChannel(client, guild.id, ch, newListContent);

    let bumpDate = util.addHours(postDate, 8 + Math.floor(Math.random() * 4)); // randoms 8-12 hours
    let expiryDate = util.addHours(postDate, 8 * 24 * 60); // 60 days post expiry

    if(dev){
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

  async editPostModal(interaction, argPostID) {
    let {guild, user} = interaction;
    let postID = argPostID;

    // idiot proof: when user edits a bump post, it refers to the original post
    let origID = await dUtil.getIdOfRepliedMsg(interaction.guild, interaction.channel.id, argPostID);
    if (origID !== "")
      postID = origID;

    if (postID == "")
      postID = interaction.options.getString('editid');
    let editPost = Post.get(postID);

    if (editPost) {
      if (editPost.authorID !== interaction.user.id || !dUtil.isMod(guild, user)) {
        return {
          success: false,
          content: `Invalid! Make sure you are editing your own post. Pinging <@!${me_id}>`,
          isModal: false,
          modal: null
        }
      }

      if (editPost.sold) {
        return {
          success: false,
          content: `Invalid! Post is already marked as sold`,
          isModal: false,
          modal: null
        }
      }

      if (editPost.deleted) {
        return {
          success: false,
          content: `Invalid! Post is already deleted`,
          isModal: false,
          modal: null
        }
      }

      let modal = this.generateModal("edit", editPost.type, null, postID, editPost.have, editPost.want);
      if (modal)
        return {
          success: true,
          content: "",
          isModal: true,
          modal: modal
        }
      else {
        return {
          success: false,
          content: `Error in editing post. Pinging <@!${me_id}>`,
          isModal: false,
          modal: null
        }
      }
    }
    else {
      return {
        success: false,
        content: `Invalid! Post/ID does not exist.`,
        isModal: false,
        modal: null
      }
    }
  }

  async editPost(client, guild, authorID, data) {
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

      switch (record.type){
        case "sell": {
          if(!util.isValidAmount(data.want)){
            return {
              posted: false,
              url: "",
              errorContent: "WANT should be a valid amount"
            };
          }
          break;
        }
        case "buy": {
          if(!util.isValidAmount(data.have)){
            return {
              posted: false,
              url: "",
              errorContent: "HAVE should be a valid amount"
            };
          }
          break;
        }
      }

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

      newListContent += `**UPDATED <#${channelID}> post from <@!${authorID}>**\n`;
      
      newListContent += "HAVE: " + (haveEdited ? `~~${record.have}~~`: "") + ` ${data.have}\n`;
      newListContent += "WANT: " + (wantEdited ? `~~${record.want}~~`: "") + ` ${data.want}\n`;
      newListContent += `${msgURL}`;

      let ch = channelsID.newListings;
      const newListMsg = await dUtil.sendMessageToChannel(client, guild.id, ch, newListContent).catch(console.error);

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

  async soldPostModal(interaction, argPostID) {
    let {guild, user} = interaction;
    let postID = argPostID;
    
    // idiot proof: when user marks a bump post as sold, it refers to the original post
    let origID = await dUtil.getIdOfRepliedMsg(interaction.guild, interaction.channel.id, argPostID);
    if (origID !== "")
      postID = origID;

    if (postID == "")
      postID = interaction.options.getString('soldid');
    let soldPost = Post.get(postID);

    if (soldPost) {
      if (soldPost.authorID !== interaction.user.id || !dUtil.isMod(guild, user)) {
        return {
          success: false,
          content: `Invalid! Make sure you are marking your own post as sold. Pinging <@!${me_id}>`,
          isModal: false,
          modal: null
        }
      }

      if (soldPost.sold) {
        return {
          success: false,
          content: `Invalid! Post is already marked as sold`,
          isModal: false,
          modal: null
        }
      }

      if (soldPost.deleted) {
        return {
          success: false,
          content: `Invalid! Post is already deleted`,
          isModal: false,
          modal: null
        }
      }

      let modal = this.generateModal("sold", soldPost.type, null, postID, soldPost.have, soldPost.want);
      if (modal)
        return {
          success: true,
          content: "",
          isModal: true,
          modal: modal
        }
      else {
        return {
          success: false,
          content: `Error in marking post as sold. Pinging <@!${me_id}>`,
          isModal: false,
          modal: null
        }
      }
    }
    else {
      return {
        success: false,
        content: `Invalid! Post/ID does not exist.`,
        isModal: false,
        modal: null
      }
    }
  }

  async soldPost(guild, data) {
    let record = Post.get(data.postID);

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
          errorContent: "Unable to edit post message"
        };
      }
      let msgURL = Post.generateUrl(message.channel.id, message.id);

      Post.markSold(
        data.postID,
        data.soldDate
      );

      record.newListID.map(async (x) => {
        let ch = channelsID.newListings;
        await dUtil.makeMessageSpoiler(guild.client, guild.id, ch, x);
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

  async deletePostModal(interaction, argPostID) {
    let {guild, user} = interaction;
    let postID = argPostID;
    
    // idiot proof: when user deletes a bump post, it refers to the original post
    let origID = await dUtil.getIdOfRepliedMsg(interaction.guild, interaction.channel.id, argPostID);
    if (origID !== "")
      postID = origID;

    if (postID == "")
      postID = interaction.options.getString('deleteid');
    let deletePost = Post.get(postID);

    if (deletePost) {
      if (deletePost.authorID !== interaction.user.id || !dUtil.isMod(guild, user)) {
        return {
          success: false,
          content: `Invalid! Make sure you are deleting your own post. Pinging <@!${me_id}>`,
          isModal: false,
          modal: null
        }
      }

      if (deletePost.deleted) {
        return {
          success: false,
          content: `Invalid! Post is already deleted`,
          isModal: false,
          modal: null
        }
      }

      let modal = this.generateModal("delete", deletePost.type, null, postID, deletePost.have, deletePost.want);
      if (modal)
        return {
          success: true,
          content: "",
          isModal: true,
          modal: modal
        }
      else {
        return {
          success: false,
          content: `Error in deleting post. Pinging <@!${me_id}>`,
          isModal: false,
          modal: null
        }
      }
    }
    else {
      return {
        success: false,
        content: `Invalid! Post/ID does not exist.`,
        isModal: false,
        modal: null
      }
    }
  }

  async deletePost(guild, data) {
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
      if(!deletedPostMsg){
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
        let ch = channelsID.newListings;
        await dUtil.makeMessageSpoiler(guild.client, guild.id, ch, x);
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

  async listPost(interaction) {
    const author = interaction.options.getUser("user");
    const itemrole = interaction.options.getRole("listitemrole");
    let authorID = "";
    let itemroleID = "";
    if (author) authorID = author.id;
    if (itemrole) itemroleID = itemrole.id;

    if (authorID == null && itemroleID == null) {
      authorID = interaction.user.id;
    }

    let records = Post.list(authorID, itemroleID);
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

    // now returns first 10 items only
    records = records.slice(0, 10);
    records.map(x => {
      channel = Post.getChannelFromType(x.type);
      content += `<#${channel}> ${x.postID}\nHAVE: ${x.have}\nWANT: ${x.want}\n${Post.generateUrl(channel, x.postID)}\n\n`;
    });

    return {
      success: true,
      content: content,
      isModal: false,
      modal: null
    }
  }

  buildRoleField(itemrole) {
    const role = new TextInputBuilder()
      .setCustomId(itemrole.id.toString())
      .setLabel("Item Role [DO NOT EDIT ROLE]")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(itemrole.id.toString())
      .setValue(itemrole.name);
    return role;
  }

  buildHaveField(value) {
    const have = new TextInputBuilder()
      .setCustomId('have')
      .setLabel("Have")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setMinLength(1)
      .setRequired(true);
    if (value) have.setValue(value);
    return have;
  }

  buildWantField(value) {
    const want = new TextInputBuilder()
      .setCustomId('want')
      .setLabel("Want")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setMinLength(1)
      .setRequired(true);
    if (value) want.setValue(value);
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
      .setMaxLength(1500)
      .setMinLength(1)
      .setPlaceholder('Enter post details here...')
      .setRequired(false);
    return want;
  }

  buildPostIDField(value) {
    const postId = new TextInputBuilder()
      .setCustomId(value)
      .setLabel("Post ID: DO NOT EDIT")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(value)
      .setRequired(true)
      .setValue(value);
    return postId;
  }

  generateModal(mode, type, itemrole, postID, have, want) {
    let modal = new ModalBuilder();
    let haveField = this.buildHaveField(have);
    let wantField = this.buildWantField(want);

    switch (type) {
      case "sell": {
        haveField.setPlaceholder("Item name");
        wantField.setPlaceholder("Enter the actual amount");
        break;
      }
      case "buy": {
        haveField.setPlaceholder("Enter the actual amount");
        wantField.setPlaceholder("Item name");
        break;
      }
      case "trade": {
        haveField.setPlaceholder("Item name, no cash only");
        wantField.setPlaceholder("Item name, no cash only");
        break;
      }
    }

    let components = [
      new ActionRowBuilder().addComponents(haveField),
      new ActionRowBuilder().addComponents(wantField),
    ];



    if (mode == "new") {
      components.push(new ActionRowBuilder().addComponents(this.buildImgurField()));
      components.push(new ActionRowBuilder().addComponents(this.buildDetailsField()));

      const { id, title } = this.getIdTitleFromType(type);
      modal.setCustomId(id).setTitle(`${title} an item!`);

      if (itemrole) {
        if (relevant_roles.includes(itemrole.name))
          return;
        modal.addComponents(new ActionRowBuilder().addComponents(this.buildRoleField(itemrole)));
      }
    }
    else if (mode == "edit") {
      modal.addComponents(new ActionRowBuilder().addComponents(this.buildPostIDField(postID)));
      modal.setCustomId("editPostModal").setTitle("Editing your post...");
    }
    else if (mode == "sold") {
      modal.addComponents(new ActionRowBuilder().addComponents(this.buildPostIDField(postID)));
      modal.setCustomId("soldPostModal").setTitle("Confirm as SOLD?");
    }
    else if (mode == "delete") {
      modal.addComponents(new ActionRowBuilder().addComponents(this.buildPostIDField(postID)));
      modal.setCustomId("deletePostModal").setTitle("Confirm delete post?");
    }

    modal.addComponents(components);
    return modal;

  }

  getIdTitleFromType(type) {
    switch (type) {
      case "buy": return { id: "buyPostModal", title: "Buy" };
      case "sell": return { id: "sellPostModal", title: "Sell" };
      case "trade": return { id: "tradePostModal", title: "Trade" };
    }
  }
}

module.exports = { PostManager }