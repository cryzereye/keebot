const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

class BasePostModal extends ModalBuilder {
	constructor(type) {
		super();
		let haveField = this.buildHaveField();
		let wantField = this.buildWantField();

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

		return [
			new ActionRowBuilder().addComponents(haveField),
			new ActionRowBuilder().addComponents(wantField),
		];
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

	getIdTitleFromType(type) {
		switch (type) {
			case "buy": return { id: "buyPostModal", title: "Buy" };
			case "sell": return { id: "sellPostModal", title: "Sell" };
			case "trade": return { id: "tradePostModal", title: "Trade" };
		}
	}

}

module.exports = { BasePostModal,ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle }