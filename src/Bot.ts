import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { ActivityType, BaseInteraction, Client, GatewayIntentBits, Message, Partials, PresenceData } from 'discord.js';

import { CommandProcessor } from './processor/CommandProcessor.js';
import { ContextProcessor } from './processor/ContextProcessor.js';
import { MessageProcessor } from './processor/MessageProcessor.js';
import { ModalProcessor } from './processor/ModalProcessor.js';

import { ExtractManager } from './functions/ExtractManager.js';
import { ReportManager } from './functions/ReportManager.js';
import { RoleGiverManager } from './functions/RoleGiverManager.js';
import { ScoreManager } from './functions/ScoreManager.js';
import { StatsManager } from './functions/StatsManager.js';
import { PostFactory } from './functions/post/PostFactory.js';
import { BackupService } from './service/BackupService.js';
import { BumpService } from './service/BumpService.js';
import { DiscordUtilities } from './util/DiscordUtilities.js';

import { channelsID, discord_id, discord_token } from '../json/config.json';
import { commands } from './globals/commands.json';
import { Utilities } from './util/Utilities.js';

export default class Bot {
	private client: Client;
	private roleGiverMngr: RoleGiverManager;
	private scoreMngr: ScoreManager;
	private statsMngr: StatsManager;
	private extractMngr: ExtractManager;
	private reportMngr: ReportManager;
	private cmdProc: CommandProcessor;
	private modalProc: ModalProcessor;
	private msgProc: MessageProcessor;
	private contextProc: ContextProcessor;
	private postFactory: PostFactory;
	private dUtil: DiscordUtilities;
	private util: Utilities;

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

		this.dUtil = new DiscordUtilities(this.client);
		this.util = new Utilities();

		this.assignMainGlobals();

		this.roleGiverMngr = new RoleGiverManager();
		this.reportMngr = new ReportManager();
		this.scoreMngr = new ScoreManager();
		this.statsMngr = new StatsManager();
		this.extractMngr = new ExtractManager();

		this.postFactory = new PostFactory();

		this.assignManagerGlobals();

		this.msgProc = new MessageProcessor();
		this.modalProc = new ModalProcessor();
		this.cmdProc = new CommandProcessor();
		this.contextProc = new ContextProcessor();

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
			new BackupService();
			new BumpService();

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
		globalThis.UTIL = this.util;
	}

	assignManagerGlobals() {
		globalThis.ROLEGIVERMNGR = this.roleGiverMngr;
		globalThis.SCOREMNGR = this.scoreMngr;
		globalThis.STATSMNGR = this.statsMngr;
		globalThis.EXTRACTMNGR = this.extractMngr;
		globalThis.REPORTMNGR = this.reportMngr;
	}
}