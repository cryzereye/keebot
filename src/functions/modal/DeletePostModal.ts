const { BasePostModal, ActionRowBuilder } = require('./BasePostModal');

class DeletePostModal extends BasePostModal {
    constructor(type, postID, have, want){
        let components = super(type, have, want);
        this.addComponents(new ActionRowBuilder().addComponents(this.buildPostIDField(postID)));
        this.setCustomId("deletePostModal").setTitle("Confirm delete post?");
        this.addComponents(components);
    }
}

module.exports = { DeletePostModal }