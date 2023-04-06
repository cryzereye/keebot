const { BasePostModal, ActionRowBuilder } = require('./BasePostModal');

class NewPostModal extends BasePostModal {
    constructor(type, itemrole) {
        let components = super(type);

        components.push(new ActionRowBuilder().addComponents(this.buildImgurField()));
        components.push(new ActionRowBuilder().addComponents(this.buildDetailsField()));

        const { id, title } = this.getIdTitleFromType(type);
        this.setCustomId(id).setTitle(`${title} an item!`);

        if (itemrole) {
            if (relevant_roles.includes(itemrole.name))
                return;
            this.addComponents(new ActionRowBuilder().addComponents(this.buildRoleField(itemrole)));
        }

        this.addComponents(components);
    }
}

module.exports = { NewPostModal }