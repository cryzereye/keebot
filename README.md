
# ![pepenaruhodo](images/icon.webp)Keebot - A Marketplace-Management Bot
This is the bot that manages the marketplace system of the Discord server Keebisoria, a Philippine keyboard market hosted via Discord. As of now, this bot is limited to this Discord server but we aim to provide the system globally.

### Current Features:

- Has marketplace features available. The users can send a bot command to post either an item for the configured buy/sell/trade channels. It can also edit, delete, and mark it as sold. There is also a command for listing the target user's posts and/or an item that is under a certain category. The bot also bumps the posts in a set interval. This is the post visibility.
- Saves scores for the vouches sent to a specific channel. The vouch sender points increases as he/she/they sends a vouch message with the user that they have transacted with within the server mentioned within the same message. A counterpart point for the mentioned gets added up the him/her/them upon replying to the vouch message where he/she/they got mentioned.
- Contains a stats command where the user can see anyone's stats, containing information like the transaction points, roles, transaction link with other users (based on vouches, with instance count), account creation date, and server join date. This stats serve as basis for the users to check the reliability of the user they want to check and probably transact with.
- Has a report command which users can use to report transaction-related incidents within the server. As of writing this, all discussions are done via DMs. Upon verification of the report, admin/mods can flag the report as verified and a 'verified report count' will be added to the user's stats.
- For admins (me, statically coded from the config), there is a data extraction function that reprocesses all the sent vouches. This is for data accuracy.

Development tracking board available here: [Notion kanban board](https://cryzereye.notion.site/b9e4fe70387a4f1a993e5b6d84d04516?v=a54cfda2f01f48a4a854cf9688d0f05e )

This is currently hosted in a VPS (CentOS 8) + pm2.

### Future Major Releases are moved to [keebot-ts](https://github.com/cryzereye/keebot-ts)
1. Microservice architecture via Express.js with TypeScript implementation
2. Full MongoDB support
3. Unit testing implementation - Jest
4. Bot dashboard - probably with React.js for practice
5. Dockerized cloud hosting 
