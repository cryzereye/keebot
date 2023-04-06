const { BasePostModal, ActionRowBuilder } = require('./BasePostModal');

class EditPostModal extends BasePostModal {
    constructor(type, postID, have, want){
        let components = super(type, have, want);
        this.addComponents(new ActionRowBuilder().addComponents(this.buildPostIDField(postID)));
        this.setCustomId("editPostModal").setTitle("Editing your post...");
        this.addComponents(components);
    }
}

module.exports = { EditPostModal }