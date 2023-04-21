import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export class NotificationModal extends ModalBuilder {
    constructor(){
        super();
        this.buildModal();
        this.setCustomId("notificationModal").setTitle("Ping me on these keywords!!");
    }

    buildModal() {
        for(let i = 0; i < 5; i++) {
            this.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(this.buildKeywordField(i))
            );       
        }
    }

    buildKeywordField(id: number): TextInputBuilder {
		const role = new TextInputBuilder()
			.setCustomId(id.toString())
			.setLabel("Keyword #" + id.toString())
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("Enter your keyword here...");
		return role;
	}
}