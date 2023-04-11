import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { ActivityType, BaseInteraction, Client, ClientUser, GatewayIntentBits, Message, Partials, PresenceData } from 'discord.js';

import { CommandProcessor } from './processor/CommandProcessor';
import { ContextProcessor } from './processor/ContextProcessor';
import { MessageProcessor } from './processor/MessageProcessor';
import { ModalProcessor } from './processor/ModalProcessor';

import { ExtractManager } from './functions/ExtractManager';
import { ReportManager } from './functions/ReportManager';
import { RoleGiverManager } from './functions/RoleGiverManager';
import { ScoreManager } from './functions/ScoreManager';
import { StatsManager } from './functions/StatsManager';
import { PostFactory } from './functions/post/PostFactory';
import { BackupService } from './service/BackupService';
import { BumpService } from './service/BumpService';
import { DiscordUtilities } from './util/DiscordUtilities';

const { discord_id, discord_token, channelsID } = require('../json/config.json');
const { commands } = require('./globals/commands.json');

export default class Bot {
	private client: Client;
	private rolegivermngr: RoleGiverManager;
	private scoremngr: ScoreManager;
	private statsmngr: StatsManager;
	private extractmngr: ExtractManager;
	private reportmngr: ReportManager;
	private cmdproc: CommandProcessor;
	private modalproc: ModalProcessor;
	private msgproc: MessageProcessor;
	private contextproc: ContextProcessor;
	private postfactory: PostFactory;
	private dUtil: DiscordUtilities;

	private botUser: ClientUser | any;

	constructor() {
		console.log(`[${new Date().toLocaleString()}] Starting up...`);
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildPresences
			],
			partials: [Partials.Channel]
		});

		this.dUtil = new DiscordUtilities();

		this.rolegivermngr = new RoleGiverManager();
		this.reportmngr = new ReportManager();
		this.scoremngr = new ScoreManager();
		this.statsmngr = new StatsManager();
		this.extractmngr = new ExtractManager();

		this.postfactory = new PostFactory();

		this.msgproc = new MessageProcessor();
		this.modalproc = new ModalProcessor();
		this.cmdproc = new CommandProcessor();
		this.contextproc = new ContextProcessor();

		this.declareListeners();

		console.log(`[${new Date().toLocaleString()}] Logging in ...`);
		this.client.login(discord_token);
		console.log(`[${new Date().toLocaleString()}] Logged in ...`);

		this.assignGlobals();
	}

	declareListeners(): void {
		this.client.on('ready', () => {
			this.botUser = this.client.user;
			this.buildSlashCommands();
			this.updateBotPresence();

			// floating services
			new BackupService();
			new BumpService();

			console.log(`[${new Date().toLocaleString()}] bot is ready`);
		});

		this.client.on('messageCreate', (message: Message) => {
			this.msgproc.processMessage(message);
		});

		this.client.on('interactionCreate', (interaction: BaseInteraction) => {
			if (interaction.isMessageContextMenuCommand())
				this.contextproc.processContext(interaction);
			else if (interaction.isChatInputCommand())
				this.cmdproc.processCommand(interaction);
			else if (interaction.isModalSubmit())
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
		let presence: PresenceData = {
			activities: [{
				type: ActivityType.Streaming,
				url: "https://github.com/cryzereye/keebot",
				name: "ping @admin for bugs"
			}],
			status: "online"
		}

		this.botUser.setPresence(presence);
	}

	assignGlobals() {
		globalThis.client = this.client;
		globalThis.dUtil = this.dUtil;
		globalThis.rolegivermngr = this.rolegivermngr;
		globalThis.scoremngr = this.scoremngr;
		globalThis.statsmngr = this.statsmngr;
		globalThis.extractmngr = this.extractmngr;
		globalThis.reportmngr = this.reportmngr;
	}
}