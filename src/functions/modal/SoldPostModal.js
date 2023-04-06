const { BasePostModal, ActionRowBuilder } = require('./BasePostModal');

class SoldPostModal extends BasePostModal {
    constructor(type, postID, have, want){
        let components = super(type, have, want);
        this.addComponents(new ActionRowBuilder().addComponents(this.buildPostIDField(postID)));
        this.setCustomId("soldPostModal").setTitle("Confirm as SOLD?");
        this.addComponents(components);
    }
}

module.exports = { SoldPostModal }