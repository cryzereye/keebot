import { Client, GatewayIntentBits, Partials, ActivityType, PresenceData, ClientUser } from 'discord.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';

import { CommandProcessor } from './processor/CommandProcessor';
import { ModalProcessor } from './processor/ModalProcessor';
import { MessageProcessor } from './processor/MessageProcessor';
import { ContextProcessor } from './processor/ContextProcessor';

import { Scorer } from './functions/Scorer';
import { RoleGiverManager } from './functions/RoleGiverManager';
import { ReportManager } from './functions/ReportManager';
import { BackupService } from './service/BackupService';
import { BumpService } from './service/BumpService';
import { PostFactory } from './functions/post/PostFactory';

const { discord_id, discord_token, channelsID } = require('../json/config.json');
const { commands } = require('./globals/commands.json');

export default class Bot {
	private client: Client;
	private rolegivermngr: RoleGiverManager;
	private scorer: Scorer;
	private reportmngr: ReportManager;
	private cmdproc: CommandProcessor;
	private modalproc: ModalProcessor;
	private msgproc: MessageProcessor;
	private contextproc: ContextProcessor;
	private postfactory: PostFactory;

	private botUser: ClientUser | any;

	constructor() {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildPresences
			],
			partials: [Partials.Channel]
		});

		this.rolegivermngr = new RoleGiverManager(this.client);
		this.scorer = new Scorer();
		this.reportmngr = new ReportManager(this.client);
		this.cmdproc = new CommandProcessor();
		this.modalproc = new ModalProcessor();
		this.msgproc = new MessageProcessor();
		this.contextproc = new ContextProcessor();
		this.postfactory = new PostFactory(this.client);

		// floating services
		new BackupService(this.client);
		new BumpService(this.client);

		this.declareListeners();
		this.client.login(discord_token);
	}

	declareListeners(): void {
		this.client.on('ready', () => {
			this.buildSlashCommands();
			this.updateBotPresence();

			this.botUser = this.client.user;

			console.log(`[${new Date().toLocaleString()}] bot is ready`);
		});

		this.client.on('messageCreate', message => { 
			this.msgproc.processMessage(message, this.botUser.id, this.scorer, this.rolegivermngr);
		});

		this.client.on('interactionCreate', async interaction => {
			if (interaction.isContextMenuCommand())
				this.contextproc.processContext(interaction, this.reportmngr);
			else if (interaction.isChatInputCommand())
				this.cmdproc.processCommand(interaction, this.scorer, this.rolegivermngr, this.reportmngr, this.postfactory);
			else if (interaction .isModalSubmit())
				this.modalproc.processModal(interaction, this.postfactory);
		});
	}

	async buildSlashCommands() {
		const rest = new REST({ version: '10' }).setToken(discord_token);

		await rest.put(Routes.applicationGuildCommands(discord_id, channelsID.server), { body: commands })
			.then((data: any) => console.log(`[${new Date().toLocaleString()}] Successfully registered ${data.length} application commands.`))
			.catch(console.error);
	}

	updateBotPresence(): void {
		let presence:PresenceData = {
			activities: [{
				type: ActivityType.Streaming,
				url: "https://github.com/cryzereye/keebot",
				name: "ping @gego for bugs"
			}],
			status: "online"
		}

		this.botUser.setPresence(presence);
	}
}