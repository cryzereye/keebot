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

import { channelsID, discord_id, discord_token } from '../json/config.json';
import { commands } from './globals/commands.json';

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

		this.dUtil = new DiscordUtilities(this.client);

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
			this.botUser = this.client.user;
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

		await rest.put(Routes.applicationGuildCommands(discord_id, channelsID.server), { body: commands })
			.then((data: any) => console.log(`[${new Date().toLocaleString()}] Successfully registered ${data.length} application commands.`))
			.catch(console.error);
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

		this.botUser.setPresence(presence);
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