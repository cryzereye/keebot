import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { ActivityType, BaseInteraction, Client, GatewayIntentBits, Message, Partials, PresenceData } from 'discord.js';

import * as CommandProcessor from './processor/CommandProcessor.js';
import * as ContextProcessor from './processor/ContextProcessor.js';
import * as MessageProcessor from './processor/MessageProcessor.js';
import * as ModalProcessor from './processor/ModalProcessor.js';

import * as ExtractManager from './functions/ExtractManager.js';
import * as ReportManager from './functions/ReportManager.js';
import * as RoleGiverManager from './functions/RoleGiverManager.js';
import * as ScoreManager from './functions/ScoreManager.js';
import * as StatsManager from './functions/StatsManager.js';
import * as PostFactory from './functions/post/PostFactory.js';
import * as BackupService from './service/BackupService.js';
import * as BumpService from './service/BumpService.js';
import * as DiscordUtilities from './util/DiscordUtilities.js';

import { channelsID, discord_id, discord_token } from '../json/config.json';
import { commands } from './globals/commands.json';

export default class Bot {
	private client: Client;
	private roleGiverMngr: RoleGiverManager.RoleGiverManager;
	private scoreMngr: ScoreManager.ScoreManager;
	private statsMngr: StatsManager.StatsManager;
	private extractMngr: ExtractManager.ExtractManager;
	private reportMngr: ReportManager.ReportManager;
	private cmdProc: CommandProcessor.CommandProcessor;
	private modalProc: ModalProcessor.ModalProcessor;
	private msgProc: MessageProcessor.MessageProcessor;
	private contextProc: ContextProcessor.ContextProcessor;
	private postFactory: PostFactory.PostFactory;
	private dUtil: DiscordUtilities.DiscordUtilities;

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

		this.dUtil = new DiscordUtilities.DiscordUtilities(this.client);

		this.assignMainGlobals();

		this.roleGiverMngr = new RoleGiverManager.RoleGiverManager();
		this.reportMngr = new ReportManager.ReportManager();
		this.scoreMngr = new ScoreManager.ScoreManager();
		this.statsMngr = new StatsManager.StatsManager();
		this.extractMngr = new ExtractManager.ExtractManager();

		this.postFactory = new PostFactory.PostFactory();

		this.assignManagerGlobals();

		this.msgProc = new MessageProcessor.MessageProcessor();
		this.modalProc = new ModalProcessor.ModalProcessor();
		this.cmdProc = new CommandProcessor.CommandProcessor();
		this.contextProc = new ContextProcessor.ContextProcessor();

		this.declareListeners();

		console.log(`[${new Date().toLocaleString()}] Logging in ...`);
		this.client.login(discord_token);
		console.log(`[${new Date().toLocaleString()}] Logged in ...`);
	}

	declareListeners(): void {
		this.client.on('ready', () => {
			this.buildSlashCommands();
			this.updateBotPresence();

			// floating services
			new BackupService.BackupService();
			new BumpService.BumpService();

			console.log(`[${new Date().toLocaleString()}] bot is ready`);
		});

		this.client.on('messageCreate', (message: Message) => {
			this.msgProc.processMessage(message);
		});

		this.client.on('interactionCreate', (interaction: BaseInteraction) => {
			if (interaction.isMessageContextMenuCommand())
				this.contextProc.processContext(interaction);
			else if (interaction.isChatInputCommand())
				this.cmdProc.processCommand(interaction);
			else if (interaction.isModalSubmit())
				this.modalProc.processModal(interaction, this.postFactory);
		});
	}

	async buildSlashCommands() {
		const rest = new REST({ version: '10' }).setToken(discord_token);

		const success = await rest.put(Routes.applicationGuildCommands(discord_id, channelsID.server), { body: commands }).catch(console.error);

		if (success) {
			console.log(`[${new Date().toLocaleString()}] Successfully registered application commands.`);
		}
	}

	updateBotPresence(): void {
		const presence: PresenceData = {
			activities: [{
				type: ActivityType.Streaming,
				url: "https://github.com/cryzereye/keebot",
				name: "ping @admin for bugs"
			}],
			status: "online"
		}
		if (this.client.user)
			this.client.user.setPresence(presence);
	}

	assignMainGlobals() {
		globalThis.CLIENT = this.client;
		globalThis.DUTIL = this.dUtil;
	}

	assignManagerGlobals() {
		globalThis.ROLEGIVERMNGR = this.roleGiverMngr;
		globalThis.SCOREMNGR = this.scoreMngr;
		globalThis.STATSMNGR = this.statsMngr;
		globalThis.EXTRACTMNGR = this.extractMngr;
		globalThis.REPORTMNGR = this.reportMngr;
	}
}