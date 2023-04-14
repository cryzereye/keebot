import { APIRole, ActionRowBuilder, Role, TextInputBuilder } from 'discord.js';
import { TransactionType } from '../../models/enums/TransactionType.js';
import { BasePostModal } from './BasePostModal.js';

export class NewPostModal extends BasePostModal {
    constructor(type: TransactionType, itemrole: Role | APIRole | null) {
        super();
        const components: Array<ActionRowBuilder<TextInputBuilder>> = this.buildBaseComponents(type, "", "");
        components.push(new ActionRowBuilder<TextInputBuilder>().addComponents(this.buildImgurField()));
        components.push(new ActionRowBuilder<TextInputBuilder>().addComponents(this.buildDetailsField()));

        const { id, title } = this.getIdTitleFromType(type);
        this.setCustomId(id).setTitle(`${title} an item!`);

        if (itemrole) {
            if (CONFIG.data.relevant_roles.includes(itemrole.name))
                return;
            this.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(this.buildRoleField(itemrole)));
        }

        this.addComponents(components);
    }
}
