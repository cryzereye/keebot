import { Client, GatewayIntentBits, Partials, ActivityType, PresenceData, ClientUser } from 'discord.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest/dist';

import { CommandProcessor } from './processor/CommandProcessor';
import { ModalProcessor } from './processor/ModalProcessor';
import { MessageProcessor } from './processor/MessageProcessor';
import { ContextProcessor } from './processor/ContextProcessor';

import { StatsManager } from './functions/StatsManager';
import { RoleGiverManager } from './functions/RoleGiverManager';
import { ReportManager } from './functions/ReportManager';
import { BackupService } from './service/BackupService';
import { BumpService } from './service/BumpService';
import { PostFactory } from './functions/post/PostFactory';
import { DiscordUtilities } from './util/DiscordUtilities';
import { ScoreManager } from './functions/ScoreManager';
import { Message } from 'discord.js';
import { BaseInteraction } from 'discord.js';

const { discord_id, discord_token, channelsID } = require('../json/config.json');
const { commands } = require('./globals/commands.json');

export default class Bot {
	private client: Client;
	private rolegivermngr: RoleGiverManager;
	private scoremngr: ScoreManager;
	private statsmngr: StatsManager;
	private reportmngr: ReportManager;
	private cmdproc: CommandProcessor;
	private modalproc: ModalProcessor;
	private msgproc: MessageProcessor;
	private contextproc: ContextProcessor;
	private postfactory: PostFactory;
	private dUtil: DiscordUtilities;

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

		this.dUtil = new DiscordUtilities(this.client);

		this.rolegivermngr = new RoleGiverManager(this.client);
		this.reportmngr = new ReportManager(this.client);
		this.postfactory = new PostFactory(this.client);
		this.scoremngr = new ScoreManager(this.client, this.dUtil);
		this.statsmngr = new StatsManager(this.client, this.dUtil, this.reportmngr);

		this.msgproc = new MessageProcessor(this.client, this.scoremngr, this.rolegivermngr);
		this.modalproc = new ModalProcessor(this.client);
		this.cmdproc = new CommandProcessor(this.client, this.dUtil, this.statsmngr, this.reportmngr, this.postfactory);
		this.contextproc = new ContextProcessor(this.client, this.postfactory, this.reportmngr);

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

		this.client.on('messageCreate', (message: Message) => { 
			this.msgproc.processMessage(message);
		});

		this.client.on('interactionCreate', async (interaction: BaseInteraction) => {
			if (interaction.isMessageContextMenuCommand())
				this.contextproc.processContext(interaction);
			else if (interaction.isChatInputCommand())
				this.cmdproc.processCommand(interaction);
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